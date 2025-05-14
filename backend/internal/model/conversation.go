package model

type Conv struct {
	GroupId         int    `json:"groupId"`
	UserId          int    `json:"userId"`
	Image           string    `json:"image"`
	FullName           string    `json:"fullName"`
	LastMessageDate string `json:"lastmessagedate"`
}
