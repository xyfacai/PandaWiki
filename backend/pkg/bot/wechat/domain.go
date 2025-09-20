package wechat

import (
	"context"
	"encoding/xml"
	"sync"
	"time"

	"github.com/chaitin/panda-wiki/log"
	"github.com/chaitin/panda-wiki/repo/pg"
)

type WechatConfig struct {
	Ctx            context.Context
	CorpID         string
	Token          string
	EncodingAESKey string
	kbID           string
	Secret         string
	AccessToken    string
	TokenExpire    time.Time
	AgentID        string
	logger         *log.Logger
	// db
	WeRepo *pg.WechatRepository
}

type ReceivedMessage struct {
	ToUserName   string `xml:"ToUserName"`
	FromUserName string `xml:"FromUserName"`
	CreateTime   int64  `xml:"CreateTime"`
	MsgType      string `xml:"MsgType"`
	Content      string `xml:"Content"`
	MsgID        string `xml:"MsgId"`
}

type ResponseMessage struct {
	XMLName      xml.Name `xml:"xml"`
	ToUserName   CDATA    `xml:"ToUserName"`
	FromUserName CDATA    `xml:"FromUserName"`
	CreateTime   int64    `xml:"CreateTime"`
	MsgType      CDATA    `xml:"MsgType"`
	Content      CDATA    `xml:"Content"`
}

type CDATA struct {
	Value string `xml:",cdata"`
}

type BackendRequest struct {
	Question string `json:"question"`
	UserID   string `json:"user_id"`
}

type BackendResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    struct {
		TextResponse string `json:"test_response"`
	} `json:"data"`
}

// UserInfo 用于存储获取到的用户信息
type UserInfo struct {
	Errcode    int    `json:"errcode"`
	Errmsg     string `json:"errmsg"`
	UserID     string `json:"userid"`
	Name       string `json:"name"`
	Department []int  `json:"department"`
	Mobile     string `json:"mobile"`
	Email      string `json:"email"`
	Status     int    `json:"status"`
}

// 获取token的回应的消息
type AccessToken struct {
	Errcode     int    `json:"errcode"`
	Errmsg      string `json:"errmsg"`
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
}

type TokenCache struct {
	AccessToken string
	TokenExpire time.Time
	Mutex       sync.Mutex
}

var tokenCache *TokenCache = &TokenCache{}

// media
// Upload file response
type MediaUploadResponse struct {
	ErrCode   int    `json:"errcode"`
	ErrMsg    string `json:"errmsg"`
	MediaType string `json:"type"`
	MediaID   string `json:"media_id"`
	CreatedAt string `json:"created_at"`
}
