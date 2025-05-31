package request

type Login struct {
	Email    string `json:"email"` // Email or Username
	Password string `json:"password"`
}

type GetPosts struct {
	StartId int    `json:"startId"`
}

type GetPost struct {
	PostId  int    `json:"postId"`
}

type AddPost struct {
	Caption string `json:"caption"`
	Privacy string `json:"privacy"`
	Image   string `json:"image"`
}

type ReactToPost struct {
	Session  string `json:"session"`
	PostId   int    `json:"postId"`
	Reaction *bool  `json:"reaction"`
}


type GetPostShares struct {
	PostId  int    `json:"postId"`
	Session string `json:"session"`
}

type AddPostShare struct {
	PostId  int    `json:"postId"`
	UserId  int    `json:"userId"`
	Session string `json:"session"`
}

type RemovePostShare struct {
	PostId  int    `json:"postId"`
	UserId  int    `json:"userId"`
	Session string `json:"session"`
}