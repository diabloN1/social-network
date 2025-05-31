package model

type Post struct {
	ID           int            `json:"id"`
	UserId       int            `json:"user_id"`
	Author       string         `json:"author"`
	CategoryID   int            `json:"category_id"`
	Title        string         `json:"title"`
	Text         string         `json:"text"`
	CreationDate string         `json:"creation_date"`
	Comment      []*Comment     `json:"comments"`
	Privacy      string         `json:"privacy"`
	Caption      string         `json:"caption"`
	Image        string         `json:"image"`
	User         *User          `json:"user"`
	Reactions    ReactionCounts `json:"reactions"`
	CommentCount int            `json:"comment_count"`
}
