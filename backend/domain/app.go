package domain

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type AppType uint8

const (
	AppTypeWeb AppType = iota + 1
	AppTypeWidget
	AppTypeDingTalkBot
	AppTypeFeishuBot
	AppTypeWechatBot
	AppTypeWechatServiceBot
	AppTypeDisCordBot
	AppTypeWechatOfficialAccount
)

var AppTypes = []AppType{
	AppTypeWeb,
	AppTypeWidget,
	AppTypeDingTalkBot,
	AppTypeFeishuBot,
	AppTypeWechatBot,
	AppTypeWechatServiceBot,
	AppTypeDisCordBot,
	AppTypeWechatOfficialAccount,
}

type App struct {
	ID   string  `json:"id" gorm:"primaryKey"`
	KBID string  `json:"kb_id"`
	Name string  `json:"name"`
	Type AppType `json:"type"`

	Settings AppSettings `json:"settings" gorm:"type:jsonb"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type AppSettings struct {
	// nav
	Title string `json:"title,omitempty"`
	Icon  string `json:"icon,omitempty"`
	Btns  []any  `json:"btns,omitempty"`
	// welcome
	WelcomeStr         string   `json:"welcome_str,omitempty"`
	SearchPlaceholder  string   `json:"search_placeholder,omitempty"`
	RecommendQuestions []string `json:"recommend_questions,omitempty"`
	RecommendNodeIDs   []string `json:"recommend_node_ids,omitempty"`
	// seo
	Desc        string `json:"desc,omitempty"`
	Keyword     string `json:"keyword,omitempty"`
	AutoSitemap bool   `json:"auto_sitemap,omitempty"`
	// inject code
	HeadCode string `json:"head_code,omitempty"`
	BodyCode string `json:"body_code,omitempty"`
	// DingTalkBot
	DingTalkBotIsEnabled    *bool  `json:"dingtalk_bot_is_enabled,omitempty"`
	DingTalkBotClientID     string `json:"dingtalk_bot_client_id,omitempty"`
	DingTalkBotClientSecret string `json:"dingtalk_bot_client_secret,omitempty"`
	DingTalkBotTemplateID   string `json:"dingtalk_bot_template_id,omitempty"`
	// FeishuBot
	FeishuBotIsEnabled *bool  `json:"feishu_bot_is_enabled,omitempty"`
	FeishuBotAppID     string `json:"feishu_bot_app_id,omitempty"`
	FeishuBotAppSecret string `json:"feishu_bot_app_secret,omitempty"`
	// WechatAppBot
	WeChatAppIsEnabled      *bool  `json:"wechat_app_is_enabled,omitempty"`
	WeChatAppToken          string `json:"wechat_app_token,omitempty"`
	WeChatAppEncodingAESKey string `json:"wechat_app_encodingaeskey,omitempty"`
	WeChatAppCorpID         string `json:"wechat_app_corpid,omitempty"`
	WeChatAppSecret         string `json:"wechat_app_secret,omitempty"`
	WeChatAppAgentID        string `json:"wechat_app_agent_id,omitempty"`
	// WechatServiceBot
	WeChatServiceIsEnabled      *bool  `json:"wechat_service_is_enabled,omitempty"`
	WeChatServiceToken          string `json:"wechat_service_token,omitempty"`
	WeChatServiceEncodingAESKey string `json:"wechat_service_encodingaeskey,omitempty"`
	WeChatServiceCorpID         string `json:"wechat_service_corpid,omitempty"`
	WeChatServiceSecret         string `json:"wechat_service_secret,omitempty"`
	// DisCordBot
	DiscordBotIsEnabled *bool  `json:"discord_bot_is_enabled,omitempty"`
	DiscordBotToken     string `json:"discord_bot_token,omitempty"`
	// WechatOfficialAccount
	WechatOfficialAccountIsEnabled      *bool  `json:"wechat_official_account_is_enabled,omitempty"`
	WechatOfficialAccountAppID          string `json:"wechat_official_account_app_id,omitempty"`
	WechatOfficialAccountAppSecret      string `json:"wechat_official_account_app_secret,omitempty"`
	WechatOfficialAccountToken          string `json:"wechat_official_account_token,omitempty"`
	WechatOfficialAccountEncodingAESKey string `json:"wechat_official_account_encodingaeskey,omitempty"`

	// theme
	ThemeMode     string        `json:"theme_mode,omitempty"`
	ThemeAndStyle ThemeAndStyle `json:"theme_and_style"`
	// catalog settings
	CatalogSettings CatalogSettings `json:"catalog_settings"`
	// footer settings
	FooterSettings FooterSettings `json:"footer_settings"`
	// Widget bot settings
	WidgetBotSettings WidgetBotSettings `json:"widget_bot_settings"`
	// webapp comment settings
	WebAppCommentSettings WebAppCommentSettings `json:"web_app_comment_settings"`
	// document feedback
	DocumentFeedBackIsEnabled *bool `json:"document_feedback_is_enabled,omitempty"`
	// AI feedback
	AIFeedbackSettings AIFeedbackSettings `json:"ai_feedback_settings"`
}

type WebAppCommentSettings struct {
	IsEnable         bool `json:"is_enable"`
	ModerationEnable bool `json:"moderation_enable"`
}

type AIFeedbackSettings struct {
	AIFeedbackIsEnabled *bool    `json:"is_enabled"`
	AIFeedbackType      []string `json:"ai_feedback_type"`
}

type ThemeAndStyle struct {
	BGImage string `json:"bg_image,omitempty"`
}

type CatalogSettings struct {
	CatalogFolder  int `json:"catalog_folder,omitempty"`  // 1: 展开, 2: 折叠, default: 1
	CatalogWidth   int `json:"catalog_width,omitempty"`   // 200 - 300, default: 260
	CatalogVisible int `json:"catalog_visible,omitempty"` // 1: 显示, 2: 隐藏, default: 1
}

type FooterSettings struct {
	FooterStyle string       `json:"footer_style,omitempty"`
	CorpName    string       `json:"corp_name,omitempty"`
	ICP         string       `json:"icp,omitempty"`
	BrandName   string       `json:"brand_name,omitempty"`
	BrandDesc   string       `json:"brand_desc,omitempty"`
	BrandLogo   string       `json:"brand_logo,omitempty"`
	BrandGroups []BrandGroup `json:"brand_groups,omitempty"`
}

type WidgetBotSettings struct {
	IsOpen    bool   `json:"is_open,omitempty"`
	ThemeMode string `json:"theme_mode,omitempty"`
	BtnText   string `json:"btn_text,omitempty"`
	BtnLogo   string `json:"btn_logo,omitempty"`
}

type BrandGroup struct {
	Name  string `json:"name,omitempty"`
	Links []Link `json:"links,omitempty"`
}

type Link struct {
	Name string `json:"name,omitempty"`
	URL  string `json:"url,omitempty"`
}

func (s *AppSettings) Scan(value any) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("invalid app settings value type:", value))
	}
	return json.Unmarshal(bytes, s)
}

func (s AppSettings) Value() (driver.Value, error) {
	return json.Marshal(s)
}

type AppDetailResp struct {
	ID   string `json:"id" gorm:"primaryKey"`
	KBID string `json:"kb_id"`

	Name string  `json:"name"`
	Type AppType `json:"type"`

	Settings AppSettingsResp `json:"settings" gorm:"type:jsonb"`

	RecommendNodes []*RecommendNodeListResp `json:"recommend_nodes,omitempty" gorm:"-"`
}

type AppSettingsResp struct {
	// nav
	Title string `json:"title,omitempty"`
	Icon  string `json:"icon,omitempty"`
	Btns  []any  `json:"btns,omitempty"`
	// welcome
	WelcomeStr         string   `json:"welcome_str,omitempty"`
	SearchPlaceholder  string   `json:"search_placeholder,omitempty"`
	RecommendQuestions []string `json:"recommend_questions,omitempty"`
	RecommendNodeIDs   []string `json:"recommend_node_ids,omitempty"`
	// seo
	Desc        string `json:"desc,omitempty"`
	Keyword     string `json:"keyword,omitempty"`
	AutoSitemap bool   `json:"auto_sitemap,omitempty"`
	// inject code
	HeadCode string `json:"head_code,omitempty"`
	BodyCode string `json:"body_code,omitempty"`
	// DingTalkBot
	DingTalkBotIsEnabled    *bool  `json:"dingtalk_bot_is_enabled,omitempty"`
	DingTalkBotClientID     string `json:"dingtalk_bot_client_id,omitempty"`
	DingTalkBotClientSecret string `json:"dingtalk_bot_client_secret,omitempty"`
	DingTalkBotTemplateID   string `json:"dingtalk_bot_template_id,omitempty"`
	// FeishuBot
	FeishuBotIsEnabled *bool  `json:"feishu_bot_is_enabled,omitempty"`
	FeishuBotAppID     string `json:"feishu_bot_app_id,omitempty"`
	FeishuBotAppSecret string `json:"feishu_bot_app_secret,omitempty"`
	// WechatAppBot
	WeChatAppIsEnabled      *bool  `json:"wechat_app_is_enabled,omitempty"`
	WeChatAppToken          string `json:"wechat_app_token,omitempty"`
	WeChatAppEncodingAESKey string `json:"wechat_app_encodingaeskey,omitempty"`
	WeChatAppCorpID         string `json:"wechat_app_corpid,omitempty"`
	WeChatAppSecret         string `json:"wechat_app_secret,omitempty"`
	WeChatAppAgentID        string `json:"wechat_app_agent_id,omitempty"`
	// WechatServiceBot
	WeChatServiceIsEnabled      *bool  `json:"wechat_service_is_enabled,omitempty"`
	WeChatServiceToken          string `json:"wechat_service_token,omitempty"`
	WeChatServiceEncodingAESKey string `json:"wechat_service_encodingaeskey,omitempty"`
	WeChatServiceCorpID         string `json:"wechat_service_corpid,omitempty"`
	WeChatServiceSecret         string `json:"wechat_service_secret,omitempty"`
	// DisCordBot
	DiscordBotIsEnabled *bool  `json:"discord_bot_is_enabled,omitempty"`
	DiscordBotToken     string `json:"discord_bot_token,omitempty"`
	// WechatOfficialAccount
	WechatOfficialAccountIsEnabled      *bool  `json:"wechat_official_account_is_enabled,omitempty"`
	WechatOfficialAccountAppID          string `json:"wechat_official_account_app_id,omitempty"`
	WechatOfficialAccountAppSecret      string `json:"wechat_official_account_app_secret,omitempty"`
	WechatOfficialAccountToken          string `json:"wechat_official_account_token,omitempty"`
	WechatOfficialAccountEncodingAESKey string `json:"wechat_official_account_encodingaeskey,omitempty"`
	// theme
	ThemeMode     string        `json:"theme_mode,omitempty"`
	ThemeAndStyle ThemeAndStyle `json:"theme_and_style"`
	// catalog settings
	CatalogSettings CatalogSettings `json:"catalog_settings"`
	// footer settings
	FooterSettings FooterSettings `json:"footer_settings"`
	// WidgetBot
	WidgetBotSettings WidgetBotSettings `json:"widget_bot_settings"`
	// webapp comment settings
	WebAppCommentSettings WebAppCommentSettings `json:"web_app_comment_settings"`
	// document feedback
	DocumentFeedBackIsEnabled *bool `json:"document_feedback_is_enabled,omitempty"`
	// AI feedback
	AIFeedbackSettings AIFeedbackSettings `json:"ai_feedback_settings,omitempty"`
}

func (s *AppSettingsResp) Scan(value any) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("invalid app settings value type:", value))
	}
	return json.Unmarshal(bytes, s)
}

func (s AppSettingsResp) Value() (driver.Value, error) {
	return json.Marshal(s)
}

type UpdateAppReq struct {
	Name     *string      `json:"name"`
	Settings *AppSettings `json:"settings" gorm:"type:jsonb"`
}

type CreateAppReq struct {
	Name string  `json:"name"`
	Type AppType `json:"type" validate:"required,oneof=1 2 3 4 5 6 7 8"`
	Icon string  `json:"icon"`
	KBID string  `json:"kb_id" validate:"required"`
}

type AppInfoResp struct {
	Name string `json:"name"`

	Settings AppSettingsResp `json:"settings" gorm:"type:jsonb"`

	RecommendNodes []*RecommendNodeListResp `json:"recommend_nodes,omitempty" gorm:"-"`
}
