package middleware

import (
	"net/http"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"

	"github.com/chaitin/panda-wiki/domain"
	"github.com/chaitin/panda-wiki/log"
	"github.com/chaitin/panda-wiki/usecase"
)

type ShareAuthMiddleware struct {
	logger    *log.Logger
	kbUsecase *usecase.KnowledgeBaseUsecase
}

func NewShareAuthMiddleware(logger *log.Logger, kbUsecase *usecase.KnowledgeBaseUsecase) *ShareAuthMiddleware {
	return &ShareAuthMiddleware{
		logger:    logger.WithModule("middleware.share_auth"),
		kbUsecase: kbUsecase,
	}
}

func (h *ShareAuthMiddleware) CheckForbidden(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		kbID := c.Request().Header.Get("X-KB-ID")
		if kbID == "" {
			h.logger.Error("kb_id is empty")
			return c.JSON(http.StatusBadRequest, domain.Response{
				Success: false,
				Message: "kb_id is required",
			})
		}

		kb, err := h.kbUsecase.GetKnowledgeBase(c.Request().Context(), kbID)
		if err != nil {
			h.logger.Error("get knowledge base failed", log.String("kb_id", kbID), log.Error(err))
			return c.JSON(http.StatusInternalServerError, domain.Response{
				Success: false,
				Message: "failed to get knowledge base detail",
			})
		}

		if kb.AccessSettings.IsForbidden {
			h.logger.Warn("access forbidden", log.String("kb_id", kbID))
			return c.JSON(http.StatusForbidden, domain.Response{
				Success: false,
				Message: "access is forbidden",
			})
		}

		return next(c)
	}
}

func (h *ShareAuthMiddleware) Authorize(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		kbID := c.Request().Header.Get("X-KB-ID")
		if kbID == "" {
			h.logger.Error("kb_id is empty")
			return c.JSON(http.StatusUnauthorized, domain.Response{
				Success: false,
				Message: "Unauthorized",
			})
		}

		kb, err := h.kbUsecase.GetKnowledgeBase(c.Request().Context(), kbID)
		if err != nil {
			h.logger.Error("get knowledge base failed", log.String("kb_id", kbID), log.Error(err))
			return c.JSON(http.StatusUnauthorized, domain.Response{
				Success: false,
				Message: "Unauthorized",
			})
		}

		if kb.AccessSettings.IsForbidden {
			h.logger.Warn("access forbidden", log.String("kb_id", kbID))
			return c.JSON(http.StatusForbidden, domain.Response{
				Success: false,
				Message: "access is forbidden",
			})
		}

		// 未开启认证
		if !kb.AccessSettings.EnterpriseAuth.Enabled && !kb.AccessSettings.SimpleAuth.Enabled {
			return next(c)
		}

		sess, err := session.Get(domain.SessionName, c)
		if err != nil {
			h.logger.Error("session get failed", log.Error(err))
			return c.JSON(http.StatusUnauthorized, domain.Response{
				Success: false,
				Message: "Unauthorized",
			})
		}

		KbIDSess, ok := sess.Values["kb_id"].(string)
		if !ok || kbID == "" || KbIDSess != kb.ID {
			h.logger.Error("kb_id valid failed", log.Error(err))
			return c.JSON(http.StatusUnauthorized, domain.Response{
				Success: false,
				Message: "Unauthorized",
			})
		}

		// 企业认证
		if kb.AccessSettings.EnterpriseAuth.Enabled {
			userId, ok := sess.Values["user_id"].(uint)
			if !ok || userId == 0 {
				h.logger.Error("session user_id get failed", log.Error(err))
				return c.JSON(http.StatusUnauthorized, domain.Response{
					Success: false,
					Message: "Unauthorized",
				})
			}
			c.Set("user_id", userId)
			return next(c)
		}

		return next(c)
	}
}
