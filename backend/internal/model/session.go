package model

import (
	"time"

	"github.com/google/uuid"
	_ "github.com/google/uuid"
)

type Session struct {
	UserID    int
	Session   string
	ExpiresAt time.Time
}

func CreateSession(userID int) *Session {
	session := uuid.NewString()
	expiresAt := time.Now().Add(12000 * time.Second)
	return &Session{UserID: userID, Session: session, ExpiresAt: expiresAt}
}
