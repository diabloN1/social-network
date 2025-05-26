package model

type Conv struct {
	GroupId         int    `json:"groupId"`
	UserId          int    `json:"userId"`
	Image           string `json:"image"`
	FullName        string `json:"fullName"`
	Unreadcount     int    `json:"unreadcount"`
	LastMessage     string `json:"lastmessage"`
	LastMessageDate string `json:"lastmessagedate"`
}
