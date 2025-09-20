package usecase

import (
	"context"

	"github.com/chaitin/panda-wiki/domain"
	"github.com/chaitin/panda-wiki/log"
	"github.com/chaitin/panda-wiki/pkg/bot"
	"github.com/chaitin/panda-wiki/pkg/bot/wechat"
	"github.com/chaitin/panda-wiki/repo/pg"
)

type WechatAppUsecase struct {
	logger      *log.Logger
	AppUsecase  *AppUsecase
	authRepo    *pg.AuthRepo
	chatUsecase *ChatUsecase
	weRepo      *pg.WechatRepository
}

func NewWechatAppUsecase(logger *log.Logger, AppUsecase *AppUsecase, chatUsecase *ChatUsecase, weRepo *pg.WechatRepository, authRepo *pg.AuthRepo) *WechatAppUsecase {
	return &WechatAppUsecase{
		logger:      logger.WithModule("usecase.wechatAppUsecase"),
		AppUsecase:  AppUsecase,
		chatUsecase: chatUsecase,
		weRepo:      weRepo,
		authRepo:    authRepo,
	}
}

func (u *WechatAppUsecase) VerifyUrlWechatAPP(ctx context.Context, signature, timestamp, nonce, echoStr, KbId string, wechatConfig *wechat.WechatConfig) ([]byte, error) {
	body, err := wechatConfig.VerifyUrlWechatAPP(signature, timestamp, nonce, echoStr)
	if err != nil {
		u.logger.Error("wechat config verify url failed", log.Error(err))
		return nil, err
	}
	return body, nil
}

func (u *WechatAppUsecase) Wechat(ctx context.Context, msg *wechat.ReceivedMessage, wc *wechat.WechatConfig, KbId string) error {
	getQA := u.getQAFunc(KbId, domain.AppTypeWechatBot)

	// 调用接口，获取到用户的详细消息
	userinfo, err := wc.GetUserInfo(msg.FromUserName)
	if err != nil {
		u.logger.Error("GetUserInfo failed", log.Error(err))
		return err
	}
	u.logger.Info("get userinfo success", log.Any("userinfo", userinfo))
	wc.WeRepo = u.weRepo

	// 发送消息给用户
	err = wc.Wechat(*msg, getQA, userinfo)

	if err != nil {
		u.logger.Error("wc wechat failed", log.Error(err))
		return err
	}
	return nil
}

func (u *WechatAppUsecase) NewWechatConfig(ctx context.Context, appInfo *domain.AppDetailResp, kbID string) (*wechat.WechatConfig, error) {
	return wechat.NewWechatConfig(
		ctx,
		appInfo.Settings.WeChatAppCorpID,
		appInfo.Settings.WeChatAppToken,
		appInfo.Settings.WeChatAppEncodingAESKey,
		kbID,
		appInfo.Settings.WeChatAppSecret,
		appInfo.Settings.WeChatAppAgentID,
		u.logger,
	)
}

func (u *WechatAppUsecase) getQAFunc(kbID string, appType domain.AppType) bot.GetQAFun {
	return func(ctx context.Context, msg string, info domain.ConversationInfo, ConversationID string) (chan string, error) {
		auth, err := u.authRepo.GetAuthBySourceType(ctx, domain.AppTypeWechatBot.ToSourceType())
		if err != nil {
			u.logger.Error("get auth failed", log.Error(err))
			return nil, err
		}
		info.UserInfo.AuthUserID = auth.ID

		eventCh, err := u.chatUsecase.Chat(ctx, &domain.ChatRequest{
			Message:        msg,
			KBID:           kbID,
			AppType:        appType,
			RemoteIP:       "",
			ConversationID: ConversationID,
			Info:           info,
		})
		if err != nil {
			return nil, err
		}
		contentCh := make(chan string, 10)
		go func() {
			defer close(contentCh)
			for event := range eventCh {
				if event.Type == "done" || event.Type == "error" {
					break
				}
				if event.Type == "data" {
					contentCh <- event.Content
				}
			}
		}()
		return contentCh, nil
	}
}
