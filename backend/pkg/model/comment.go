package model

type Comment struct {
	ID           int    `json:"id"`
	UserId       int    `json:"user_id"`
	PostId       int    `json:"post_id"`
	Author       string `json:"author"`
	Text         string `json:"text"`
	Image         string `json:"image"`
	CreationDate string `json:"creation_date"`
}
