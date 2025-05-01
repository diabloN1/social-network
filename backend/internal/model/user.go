package model

import "time"

type User struct {
	ID                 int       `json:"id"`
	Username           string    `json:"username"`
	Firstname          string    `json:"firstname"`
	Lastname           string    `json:"lastname"`
	Nickname           string    `json:"nickname"`
	Password           string    `json:"password"`
	EncryptedPassword  string    `json:"-"`
	Email              string    `json:"email"`
	Gender             string    `json:"gender"`
	Birth              time.Time `json:"birth"`
	Avatar             string    `json:"avatar"`
	About              string    `json:"about"`
	Online             bool      `json:"online"`
	IsPrivate          bool      `json:"isprivate"`
	IsAccepted         bool      `json:"isaccepted"`
	Follow             Follow    `json:"follow"`
	Posts              []*Post   `json:"posts"`
	Followers          []*User   `json:"followers"`
	Following          []*User   `json:"following"`
	CurrentUser		   bool `json:"currentuser"`
	TotalNotifications int       `json:"totalnotifications"`
	LastMessageDate    string    `json:"lastmessagedate"`
}
