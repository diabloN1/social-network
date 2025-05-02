package model

type Message struct {
	ID                int    `json:"id"`
	SenderId          int    `json:"sender_id"`
	SenderUsername    string `json:"sender_username"`
	RecipientUsername string `json:"recipient_username"`
	RecipientId       int    `json:"recipient_id"`
	IsSeen            int    `json:"is_seen"`
	Text              string `json:"text"`
	CreationDate      string `json:"creation_date"`
}
