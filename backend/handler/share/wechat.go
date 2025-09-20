package share

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sbzhu/weworkapi_golang/wxbizmsgcrypt"

	"github.com/chaitin/panda-wiki/domain"
	"github.com/chaitin/panda-wiki/handler"
	"github.com/chaitin/panda-wiki/log"
	"github.com/chaitin/panda-wiki/pkg/bot/wechat"
	"github.com/chaitin/panda-wiki/pkg/bot/wechatservice"
	"github.com/chaitin/panda-wiki/usecase"
)

type ShareWechatHandler struct {
	*handler.BaseHandler
	logger           *log.Logger
	appCase          *usecase.AppUsecase
	conversationCase *usecase.ConversationUsecase
	wechatUsecase    *usecase.WechatUsecase
	wechatAppUsecase *usecase.WechatAppUsecase
}

func NewShareWechatHandler(
	e *echo.Echo,
	baseHandler *handler.BaseHandler,
	logger *log.Logger,
	appCase *usecase.AppUsecase,
	conversationCase *usecase.ConversationUsecase,
	wechatUsecase *usecase.WechatUsecase,
	wechatAppUsecase *usecase.WechatAppUsecase,
) *ShareWechatHandler {
	h := &ShareWechatHandler{
		BaseHandler:      baseHandler,
		logger:           logger.WithModule("handler.share.wechat"),
		appCase:          appCase,
		conversationCase: conversationCase,
		wechatUsecase:    wechatUsecase,
		wechatAppUsecase: wechatAppUsecase,
	}

	share := e.Group("share/v1/app",
		func(next echo.HandlerFunc) echo.HandlerFunc {
			return func(c echo.Context) error {
				c.Response().Header().Set("Access-Control-Allow-Origin", "*")
				c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type, Origin, Accept")
				if c.Request().Method == "OPTIONS" {
					return c.NoContent(http.StatusOK)
				}
				return next(c)
			}
		})
	// 微信客服
	share.GET("/wechat/service", h.VerifyUrlWechatService)
	share.POST("/wechat/service", h.WechatHandlerService)

	share.GET("/wechat/service/answer", h.GetWechatAnswer)
	//企业微信
	share.GET("/wechat/app", h.VerifyUrlWechatApp)
	share.POST("/wechat/app", h.WechatHandlerApp)

	return h
}

// GetWechatAnswer
//
//	@Summary		GetWechatAnswer
//	@Description	GetWechatAnswer
//	@Tags			Wechat
//	@Accept			json
//	@Produce		json
//	@Param			id	query		string	true	"conversation id"
//	@Success		200	{object}	domain.Response
//
//	@Router			/share/v1/app/wechat/service/answer [get]
func (h *ShareWechatHandler) GetWechatAnswer(c echo.Context) error {
	conversationID := c.QueryParam("id")
	if conversationID == "" {
		return h.NewResponseWithError(c, "conversation_id is required", nil)
	}

	c.Response().Header().Set("Content-Type", "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")
	c.Response().Header().Set("Transfer-Encoding", "chunked")

	// checkout if the conversation exists in map
	val, ok := domain.ConversationManager.Load(conversationID)
	if !ok { // not exist check db
		conversation, err := h.conversationCase.GetConversationDetail(c.Request().Context(), "", conversationID)
		if err != nil {
			return h.sendErrMsg(c, err.Error())
		}
		// send answer and question
		if err := h.writeSSEEvent(c, domain.SSEEvent{Type: "question", Content: conversation.Messages[0].Content}); err != nil {
			return err
		}
		//2.answer
		if err := h.writeSSEEvent(c, domain.SSEEvent{Type: "answer", Content: conversation.Messages[1].Content}); err != nil {
			return err
		}
		//3.
		if err := h.writeSSEEvent(c, domain.SSEEvent{Type: "done", Content: ""}); err != nil {
			return err
		}
		return nil
	}

	// exit --> get message
	state := val.(*domain.ConversationState)
	// 1. send question
	if err := h.writeSSEEvent(c, domain.SSEEvent{Type: "question", Content: state.Question}); err != nil {
		return err
	}
	//2. send answer
	state.Mutex.Lock()
	if err := h.writeSSEEvent(c, domain.SSEEvent{Type: "answer", Content: state.Buffer.String()}); err != nil {
		return err
	}
	state.IsVisited = true
	state.Mutex.Unlock()

	defer func() {
		state.Mutex.Lock()
		state.IsVisited = false
		state.Mutex.Unlock()
	}()

	for answer := range state.NotificationChan { // listen if has new data
		if err := h.writeSSEEvent(c, domain.SSEEvent{Type: "answer", Content: answer}); err != nil {
			return err
		} // catch err
	}

	return h.writeSSEEvent(c, domain.SSEEvent{Type: "done", Content: ""})
}

func (h *ShareWechatHandler) sendErrMsg(c echo.Context, errMsg string) error {
	return h.writeSSEEvent(c, domain.SSEEvent{Type: "error", Content: errMsg})
}

func (h *ShareWechatHandler) writeSSEEvent(c echo.Context, data any) error {
	jsonContent, err := json.Marshal(data)
	if err != nil {
		return err
	}

	sseMessage := fmt.Sprintf("data: %s\n\n", string(jsonContent))
	if _, err := c.Response().Write([]byte(sseMessage)); err != nil {
		return err
	}
	c.Response().Flush()
	return nil
}

// callback wechat verify
func (h *ShareWechatHandler) VerifyUrlWechatService(c echo.Context) error {
	signature := c.QueryParam("msg_signature")
	timestamp := c.QueryParam("timestamp")
	nonce := c.QueryParam("nonce")
	echoStr := c.QueryParam("echostr")

	kbID := c.Request().Header.Get("X-KB-ID")

	if kbID == "" {
		return h.NewResponseWithError(c, "kb_id is required", nil)
	}

	if signature == "" || timestamp == "" || nonce == "" || echoStr == "" {
		return h.NewResponseWithError(
			c, "verify wechat service params failed", nil,
		)
	}

	ctx := c.Request().Context()

	appInfo, err := h.appCase.GetAppDetailByKBIDAndAppType(ctx, kbID, domain.AppTypeWechatServiceBot)

	if err != nil {
		h.logger.Error("find app detail failed", log.Error(err))
		return err
	}
	if appInfo.Settings.WeChatServiceIsEnabled != nil && !*appInfo.Settings.WeChatServiceIsEnabled {
		h.logger.Error("wechat service bot is not enabled", log.Error(err))
		return errors.New("wechat service bot is not enabled")
	}

	WechatServiceConf, err := h.wechatUsecase.NewWechatServiceConfig(ctx, appInfo, kbID)
	if err != nil {
		h.logger.Error("failed to create WechatServiceConfig", log.Error(err))
		return err
	}

	req, err := h.wechatUsecase.VerifyUrlWechatService(ctx, signature, timestamp, nonce, echoStr, WechatServiceConf)
	if err != nil {
		h.logger.Error("VerifyURL_Service failed", log.Error(err))
		return err
	}

	// success
	return c.String(http.StatusOK, string(req))
}

// handler user request and sent info to wechat
func (h *ShareWechatHandler) WechatHandlerService(c echo.Context) error {
	signature := c.QueryParam("msg_signature")
	timestamp := c.QueryParam("timestamp")
	nonce := c.QueryParam("nonce")

	kbID := c.Request().Header.Get("X-KB-ID")

	if kbID == "" {
		return h.NewResponseWithError(c, "kb_id is required", nil)
	}

	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		h.logger.Error("get request failed", log.Error(err))
		return err
	}
	defer c.Request().Body.Close()

	ctx := c.Request().Context()

	appInfo, err := h.appCase.GetAppDetailByKBIDAndAppType(ctx, kbID, domain.AppTypeWechatServiceBot)
	if err != nil {
		h.logger.Error("GetAppDetailByKBIDAndAppType failed", log.Error(err))
		return err
	}
	if appInfo.Settings.WeChatServiceIsEnabled != nil && !*appInfo.Settings.WeChatServiceIsEnabled {
		h.logger.Info("wechat service bot is not enabled")
		return nil
	}

	// 创建一个wechat service对象
	wechatServiceConf, err := h.wechatUsecase.NewWechatServiceConfig(context.Background(), appInfo, kbID)

	h.logger.Info("wechat service config", log.Any("wechat service config", wechatServiceConf))

	if err != nil {
		return err
	}

	// 解密消息
	wxCrypt := wxbizmsgcrypt.NewWXBizMsgCrypt(wechatServiceConf.Token, wechatServiceConf.EncodingAESKey, wechatServiceConf.CorpID, wxbizmsgcrypt.XmlType)
	decryptMsg, errCode := wxCrypt.DecryptMsg(signature, timestamp, nonce, body)
	if errCode != nil {
		h.logger.Error("DecryptMsg failed", log.Any("decryptMsg err", errCode))
		return nil
	}

	// 反序列化
	msg, err := wechatServiceConf.UnmarshalMsg(decryptMsg)
	if err != nil {
		h.logger.Error("UnmarshalMsg failed", log.Error(err))
		return err
	}

	go func(WechatServiceConf *wechatservice.WechatServiceConfig, msg *wechatservice.WeixinUserAskMsg, kbID string) {
		ctx := context.Background()
		err := h.wechatUsecase.WechatService(ctx, msg, kbID, WechatServiceConf)
		if err != nil {
			h.logger.Error("wechat async failed", log.Any("Wechat_Service", err))
		}
	}(wechatServiceConf, msg, kbID)

	// 先响应
	return c.JSON(http.StatusOK, "success")
}

func (h *ShareWechatHandler) VerifyUrlWechatApp(c echo.Context) error {
	signature := c.QueryParam("msg_signature")
	timestamp := c.QueryParam("timestamp")
	nonce := c.QueryParam("nonce")
	echoStr := c.QueryParam("echostr")

	kbID := c.Request().Header.Get("X-KB-ID")

	if kbID == "" {
		return h.NewResponseWithError(c, "kb_id is required", nil)
	}

	if signature == "" || timestamp == "" || nonce == "" || echoStr == "" {
		return h.NewResponseWithError(
			c, "verify wechat params failed", nil,
		)
	}

	ctx := c.Request().Context()

	//1. get wechat app bot info
	appInfo, err := h.appCase.GetAppDetailByKBIDAndAppType(ctx, kbID, domain.AppTypeWechatBot)
	if err != nil {
		h.logger.Error("get app detail failed", log.Error(err))
		return err
	}
	if appInfo.Settings.WeChatAppIsEnabled != nil && !*appInfo.Settings.WeChatAppIsEnabled {
		h.logger.Info("wechat service bot is not enabled")
		return nil
	}

	h.logger.Debug("wechat app info", log.Any("info", appInfo))

	WechatConf, err := h.wechatAppUsecase.NewWechatConfig(ctx, appInfo, kbID)
	if err != nil {
		h.logger.Error("failed to create WechatConfig", log.Error(err))
		return err
	}

	req, err := h.wechatAppUsecase.VerifyUrlWechatAPP(ctx, signature, timestamp, nonce, echoStr, kbID, WechatConf)
	if err != nil {
		return h.NewResponseWithError(c, "VerifyURL failed", err)
	}

	// success
	return c.String(http.StatusOK, string(req))
}

func (h *ShareWechatHandler) WechatHandlerApp(c echo.Context) error {
	signature := c.QueryParam("msg_signature")
	timestamp := c.QueryParam("timestamp")
	nonce := c.QueryParam("nonce")

	kbID := c.Request().Header.Get("X-KB-ID")
	if kbID == "" {
		return h.NewResponseWithError(c, "kb_id is required", nil)
	}

	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		h.logger.Error("get request failed", log.Error(err))
		return h.NewResponseWithError(c, "Internal Server Error", err)
	}
	defer c.Request().Body.Close()

	ctx := c.Request().Context()

	// get appinfo and init wechatConfig
	// 查找数据库，找到对应的app配置
	appInfo, err := h.appCase.GetAppDetailByKBIDAndAppType(ctx, kbID, domain.AppTypeWechatBot)
	if err != nil {
		return h.NewResponseWithError(c, "GetAppDetailByKBIDAndAppType failed", err)
	}

	if appInfo.Settings.WeChatAppIsEnabled != nil && !*appInfo.Settings.WeChatAppIsEnabled {
		return h.NewResponseWithError(c, "wechat app bot is not enabled", nil)
	}

	wechatConfig, err := h.wechatAppUsecase.NewWechatConfig(context.Background(), appInfo, kbID)
	if err != nil {
		return h.NewResponseWithError(c, "wechat app config error", err)
	}

	// 解密消息
	wxCrypt := wxbizmsgcrypt.NewWXBizMsgCrypt(wechatConfig.Token, wechatConfig.EncodingAESKey, wechatConfig.CorpID, wxbizmsgcrypt.XmlType)
	decryptMsg, errCode := wxCrypt.DecryptMsg(signature, timestamp, nonce, body)
	if errCode != nil {
		return h.NewResponseWithError(c, "DecryptMsg failed", nil)
	}

	msg, err := wechatConfig.UnmarshalMsg(decryptMsg)
	if err != nil {
		return h.NewResponseWithError(c, "UnmarshalMsg failed", err)
	}
	h.logger.Info("wechat app msg", log.Any("user msg", msg))

	if msg.MsgType != "text" { // 用户进入会话，或者其他非提问类型的事件
		return c.String(http.StatusOK, "")
	}

	immediateResponse, err := wechatConfig.SendResponse(*msg, "正在思考您的问题,请稍候...")
	if err != nil {
		return h.NewResponseWithError(c, "Failed to send immediate response", err)
	}

	go func(msg *wechat.ReceivedMessage, wechatConfig *wechat.WechatConfig, kbId string) {
		ctx := context.Background()
		err := h.wechatAppUsecase.Wechat(ctx, msg, wechatConfig, kbId)
		if err != nil {
			h.logger.Error("wechat async failed")
		}
	}(msg, wechatConfig, kbID)

	return c.XMLBlob(http.StatusOK, []byte(immediateResponse))
}
