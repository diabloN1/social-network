package response

import "real-time-forum/pkg/model"

type Login struct {
	Session  string `json:"session"`
	UserId   int    `json:"user_id"`
	Username string `json:"username"`
}

type RegisterError struct {
	Error
	Field string `json:"field"`
}

type GetPosts struct {
	Posts  []*model.Post `json:"posts"`
	Userid int           `json:"userid"`
}

type GetPostData struct {
	Userid int           `json:"userid,omitempty"`
	Posts  []*model.Post `json:"posts,omitempty"`
	Error  string        `json:"error,omitempty"`
}