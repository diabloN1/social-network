package model

import "time"

type Group struct {
	ID           int       `json:"id"`
	OwnerId      int       `json:"owner_id"`
	Members      []*User   `json:"members"`
	Posts      []*Post   `json:"posts"`
	Events      []*GroupEvent   `json:"events"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Image        string    `json:"image"`
	CreationDate time.Time `json:"creation_date"`
	IsOwner      bool      `json:"is_owner"`
	IsAccepted   bool      `json:"is_accepted"`
	IsPending   bool      `json:"is_pending"`
	HasNewEvent     bool   `json:"new_event"`
}
