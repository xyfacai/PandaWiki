package domain

import (
	"time"

	"github.com/chaitin/panda-wiki/consts"
)

type User struct {
	ID         string          `json:"id" gorm:"primaryKey"`
	Account    string          `json:"account" gorm:"uniqueIndex"`
	Password   string          `json:"password"`
	Role       consts.UserRole `json:"role" gorm:"default:'user'"`
	CreatedAt  time.Time       `json:"created_at"`
	LastAccess time.Time       `json:"last_access" gorm:"default:null"`
}

// KBUsers 知识库用户关联表（多对多关系）
type KBUsers struct {
	ID        int64                   `json:"id" gorm:"primaryKey;autoIncrement"`
	KBId      string                  `json:"kb_id" gorm:"uniqueIndex:idx_uniq_kb_users_kb_id_user_id"`
	UserId    string                  `json:"user_id" gorm:"uniqueIndex:idx_uniq_kb_users_kb_id_user_id"`
	Perm      consts.UserKBPermission `json:"perm"`
	CreatedAt time.Time               `json:"created_at"`
}

func (KBUsers) TableName() string {
	return "kb_users"
}

type UserAccessTime struct {
	UserID    string    `json:"user_id"`
	Timestamp time.Time `json:"timestamp"`
}
