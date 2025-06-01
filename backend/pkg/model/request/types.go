package request

type Login struct {
	Email    string `json:"email"` // Email or Username
	Password string `json:"password"`
}

type GetPosts struct {
	StartId int `json:"startId"`
}

type GetPost struct {
	PostId int `json:"postId"`
}

type AddPost struct {
	Caption string `json:"caption"`
	Privacy string `json:"privacy"`
	Image   string `json:"image"`
}

type ReactToPost struct {
	PostId   int   `json:"postId"`
	Reaction *bool `json:"reaction"`
}

type GetPostShares struct {
	PostId int `json:"postId"`
}

type AddPostShare struct {
	PostId int `json:"postId"`
	UserId int `json:"userId"`
}

type RemovePostShare struct {
	PostId int `json:"postId"`
	UserId int `json:"userId"`
}

type AddComment struct {
	PostId int    `json:"postId"`
	Text   string `json:"text"`
	Image  string `json:"image"`
}

type GetComments struct {
	PostId int `json:"postId"`
}
