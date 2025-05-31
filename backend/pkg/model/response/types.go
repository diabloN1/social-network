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

type GetPost struct {
	Userid int         `json:"userid,omitempty"`
	Post   *model.Post `json:"post,omitempty"`
}

type AddPost struct {
	Post *model.Post `json:"post,omitempty"`
}

type ReactToPost struct {
	Userid  int         `json:"userid"`
	Post    *model.Post `json:"post,omitempty"`
	Success bool        `json:"success"`
}
