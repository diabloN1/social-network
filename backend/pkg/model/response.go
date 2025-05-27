package model

type Response struct {
	Type               string      `json:"type"`
	Data               string      `json:"data"`
	Username           string      `json:"username"`
	Userid             int         `json:"userid"`
	Session            string      `json:"session"`
	Error              string      `json:"error"`
	AllUsers           []*User     `json:"allusers"`
	FollowRequests     []*User     `json:"followrequests"`
	Categories         []*Category `json:"categories"`
	Posts              []*Post     `json:"posts"`
	Postid             int         `json:"postid"`
	TotalNotifications int         `json:"totalnotifications"`
	Partnerid          int         `json:"partnerid"`
	Message            *Message    `json:"message"`
	Messages           []*Message  `json:"messages"`
	User               *User       `json:"user"`
	Success            bool        `json:"success"`
	CurrentUser        *User       `json:"currentuser"`
}
