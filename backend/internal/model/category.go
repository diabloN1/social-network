package model

type Category struct {
	ID   int     `json:"id"`
	Name string  `json:"category"`
	Post []*Post `json:"posts"`
}
