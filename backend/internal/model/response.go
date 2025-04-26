package model

type Response struct {
	Type               string      `json:"type"`
	Data               string      `json:"data"`
	Username           string      `json:"username"`
	Userid             int         `json:"userid"`
	Session            string      `json:"session"`
	Error              string      `json:"error"`
	AllUsers           []*User     `json:"allusers"`
	Categories         []*Category `json:"categories"`
	Postid             int         `json:"postid"`
	TotalNotifications int         `json:"totalnotifications"`
	Partnerid          int         `json:"partnerid"`
	Message            *Message    `json:"message"`
	Messages           []*Message  `json:"messages"`
}
