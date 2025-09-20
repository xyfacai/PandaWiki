package domain

import (
	"bytes"
	"sync"
)

// ConversationState
type ConversationState struct {
	Mutex    sync.Mutex
	Question string
	Buffer   bytes.Buffer
	// ai answer is done
	IsVisited        bool
	NotificationChan chan string
}

// ConversationManager
var ConversationManager = sync.Map{}

type WechatStatic struct {
	BaseUrl   string `json:"base_url"`
	ImagePath string `json:"image_path"`
}
