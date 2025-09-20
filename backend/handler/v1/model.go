package v1

import (
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	modelkitDomain "github.com/chaitin/ModelKit/v2/domain"
	modelkit "github.com/chaitin/ModelKit/v2/usecase"

	"github.com/chaitin/panda-wiki/consts"
	"github.com/chaitin/panda-wiki/domain"
	"github.com/chaitin/panda-wiki/handler"
	"github.com/chaitin/panda-wiki/log"
	"github.com/chaitin/panda-wiki/middleware"
	"github.com/chaitin/panda-wiki/usecase"
)

type ModelHandler struct {
	*handler.BaseHandler
	logger     *log.Logger
	auth       middleware.AuthMiddleware
	usecase    *usecase.ModelUsecase
	llmUsecase *usecase.LLMUsecase
	modelkit   *modelkit.ModelKit
}

func NewModelHandler(echo *echo.Echo, baseHandler *handler.BaseHandler, logger *log.Logger, auth middleware.AuthMiddleware, usecase *usecase.ModelUsecase, llmUsecase *usecase.LLMUsecase) *ModelHandler {
	modelkit := modelkit.NewModelKit(logger.Logger)
	handler := &ModelHandler{
		BaseHandler: baseHandler,
		logger:      logger.WithModule("handler.v1.model"),
		auth:        auth,
		usecase:     usecase,
		llmUsecase:  llmUsecase,
		modelkit:    modelkit,
	}
	group := echo.Group("/api/v1/model", handler.auth.Authorize)
	group.GET("/list", handler.GetModelList)
	group.POST("", handler.CreateModel)
	group.POST("/check", handler.CheckModel)
	group.POST("/provider/supported", handler.GetProviderSupportedModelList)
	group.PUT("", handler.UpdateModel)

	return handler
}

// get model list
//
//	@Summary		get model list
//	@Description	get model list
//	@Tags			model
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	domain.PWResponse{data=domain.ModelListItem}
//	@Router			/api/v1/model/list [get]
func (h *ModelHandler) GetModelList(c echo.Context) error {
	ctx := c.Request().Context()

	models, err := h.usecase.GetList(ctx)
	if err != nil {
		return h.NewResponseWithError(c, "get model list failed", err)
	}

	return h.NewResponseWithData(c, models)
}

// create model
//
//	@Summary		create model
//	@Description	create model
//	@Tags			model
//	@Accept			json
//	@Produce		json
//	@Param			model	body		domain.CreateModelReq	true	"create model request"
//	@Success		200		{object}	domain.Response
//	@Router			/api/v1/model [post]
func (h *ModelHandler) CreateModel(c echo.Context) error {
	var req domain.CreateModelReq
	if err := c.Bind(&req); err != nil {
		return h.NewResponseWithError(c, "invalid request", err)
	}
	if err := c.Validate(&req); err != nil {
		return h.NewResponseWithError(c, "invalid request", err)
	}

	if consts.GetLicenseEdition(c) == consts.LicenseEditionContributor && req.Provider != domain.ModelProviderBrandBaiZhiCloud {
		return h.NewResponseWithError(c, "联创版只能使用百智云模型哦~", nil)
	}
	ctx := c.Request().Context()

	param := domain.ModelParam{}
	if req.Parameters != nil {
		param = *req.Parameters
	}
	model := &domain.Model{
		ID:         uuid.New().String(),
		Provider:   req.Provider,
		Model:      req.Model,
		APIKey:     req.APIKey,
		APIHeader:  req.APIHeader,
		BaseURL:    req.BaseURL,
		APIVersion: req.APIVersion,
		Type:       req.Type,
		IsActive:   true,
		Parameters: param,
	}
	if err := h.usecase.Create(ctx, model); err != nil {
		return h.NewResponseWithError(c, "create model failed", err)
	}
	return h.NewResponseWithData(c, model)
}

// update model
//
//	@Description	update model
//	@Tags			model
//	@Accept			json
//	@Produce		json
//	@Param			model	body		domain.UpdateModelReq	true	"update model request"
//	@Success		200		{object}	domain.Response
//	@Router			/api/v1/model [put]
func (h *ModelHandler) UpdateModel(c echo.Context) error {
	var req domain.UpdateModelReq
	if err := c.Bind(&req); err != nil {
		return h.NewResponseWithError(c, "invalid request", err)
	}
	if err := c.Validate(&req); err != nil {
		return h.NewResponseWithError(c, "invalid request", err)
	}

	if consts.GetLicenseEdition(c) == consts.LicenseEditionContributor && req.Provider != domain.ModelProviderBrandBaiZhiCloud {
		return h.NewResponseWithError(c, "联创版只能使用百智云模型哦~", nil)
	}
	ctx := c.Request().Context()
	if err := h.usecase.Update(ctx, &req); err != nil {
		return h.NewResponseWithError(c, "update model failed", err)
	}
	return h.NewResponseWithData(c, nil)
}

// check model
//
//	@Summary		check model
//	@Description	check model
//	@Tags			model
//	@Accept			json
//	@Produce		json
//	@Param			model	body		domain.CheckModelReq	true	"check model request"
//	@Success		200		{object}	domain.Response{data=domain.CheckModelResp}
//	@Router			/api/v1/model/check [post]
func (h *ModelHandler) CheckModel(c echo.Context) error {
	var req domain.CheckModelReq
	if err := c.Bind(&req); err != nil {
		return h.NewResponseWithError(c, "invalid request", err)
	}
	if err := c.Validate(&req); err != nil {
		return h.NewResponseWithError(c, "invalid request", err)
	}
	ctx := c.Request().Context()
	modelType := req.Type
	switch req.Type {
	case domain.ModelTypeAnalysis: // for rag analysis
		modelType = domain.ModelTypeChat
	default:
	}
	model, err := h.modelkit.CheckModel(ctx, &modelkitDomain.CheckModelReq{
		Provider:   string(req.Provider),
		Model:      req.Model,
		BaseURL:    req.BaseURL,
		APIKey:     req.APIKey,
		APIHeader:  req.APIHeader,
		APIVersion: req.APIVersion,
		Type:       string(modelType),
	})
	if err != nil {
		return h.NewResponseWithError(c, "get model failed", err)
	}
	return h.NewResponseWithData(c, model)
}

// GetProviderSupportedModelList
//
//	@Summary		get provider supported model list
//	@Description	get provider supported model list
//	@Tags			model
//	@Accept			json
//	@Produce		json
//	@Param			params	body		domain.GetProviderModelListReq	true	"get supported model list request"
//	@Success		200		{object}	domain.PWResponse{data=domain.GetProviderModelListResp}
//	@Router			/api/v1/model/provider/supported [post]
func (h *ModelHandler) GetProviderSupportedModelList(c echo.Context) error {
	var req domain.GetProviderModelListReq
	if err := c.Bind(&req); err != nil {
		return h.NewResponseWithError(c, "invalid request", err)
	}
	if err := c.Validate(&req); err != nil {
		return h.NewResponseWithError(c, "validate request failed", err)
	}
	ctx := c.Request().Context()

	models, err := h.modelkit.ModelList(ctx, &modelkitDomain.ModelListReq{
		Provider:  req.Provider,
		BaseURL:   req.BaseURL,
		APIKey:    req.APIKey,
		APIHeader: req.APIHeader,
		Type:      string(req.Type),
	})
	if err != nil {
		return h.NewResponseWithError(c, "get user model list failed", err)
	}
	return h.NewResponseWithData(c, models)
}
