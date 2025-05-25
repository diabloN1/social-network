package model

type Message struct {
	ID           int    `json:"id"`
	SenderId     int    `json:"sender_id"`
	RecipientId  int    `json:"recipient_id"`
	IsOwned		 bool 	`json:"isOwned"`
	GroupId      int    `json:"group_id"`
	IsSeen       int    `json:"is_seen"`
	Text         string `json:"text"`
	User 	*User	`json:"user"`
	CreationDate string `json:"created_at"`
}
