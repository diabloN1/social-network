package model

import "time"

type User struct {
	ID                 int       `json:"id"`
	Username           string    `json:"username"`
	Firstname          string    `json:"firstname"`
	Lastname           string    `json:"lastname"`
	Password           string    `json:"password"`
	EncryptedPassword  string    `json:"-"`
	Email              string    `json:"email"`
	Gender             string    `json:"gender"`
	Birth              time.Time `json:"birth"`
	Avatar             string    `json:"avatar"`
	About              string    `json:"about"`
	Online             bool      `json:"online"`
	TotalNotifications int       `json:"totalnotifications"`
	LastMessageDate    string    `json:"lastmessagedate"`
}
