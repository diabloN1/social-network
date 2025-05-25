package model

type Reaction struct {
	ID           int    `json:"id"`
	PostID       int    `json:"post_id"`
	UserID       int    `json:"user_id"`
	IsLike       *bool  `json:"is_like"`
	CreationDate string `json:"creation_date"`
}

type ReactionCounts struct {
	Likes    int  `json:"likes"`
	Dislikes int  `json:"dislikes"`
	UserReaction *bool `json:"user_reaction"` 
}
