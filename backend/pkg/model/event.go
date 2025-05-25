package model

type GroupEvent struct {
	ID            int     `json:"id"`
	UserId        int     `json:"user_id"`
	User          *User   `json:"user"`
	GroupId       int     `json:"group_id"`
	Title         string  `json:"title"`
	Description   string  `json:"description"`
	Option1       string  `json:"option_1"`
	Opt1Users     []*User `json:"opt1_users"`
	Option2       string  `json:"option_2"`
	Opt2Users     []*User `json:"opt2_users"`
	Date          string  `json:"date"`
	Place         string  `json:"place"`
	CurrentOption string    `json:"current_option"`
	CreationDate  string  `json:"creation_date"`
}

type EventOption struct {
	ID      int   `json:"id"`
	EventId int   `json:"event_id"`
	User    *User `json:"user"`
	IsGoing bool  `json:"isGoing"`
}
