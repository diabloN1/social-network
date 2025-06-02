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

type GetProfile struct {
	ProfileId int `json:"profileId"`
}

type SetProfilePrivacy struct {
	State bool `json:"state"`
}

type CreateGroup struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
}

type GetGroupData struct {
	GroupId int `json:"groupId"`
}

type AddGroupPost struct {
	GroupId int    `json:"groupId"`
	Caption string `json:"caption"`
	Image   string `json:"image"`
}

type AddGroupEvent struct {
	GroupId     int    `json:"groupId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Option1     string `json:"option1"`
	Option2     string `json:"option2"`
	Date        string `json:"date"`
	Place       string `json:"place"`
}

type GetGroupInviteUsers struct {
	GroupId int `json:"groupId"`
}

type InviteUserToGroup struct {
	GroupId int `json:"groupId"`
	UserId  int `json:"userId"`
}

type RespondToGroupInvitation struct {
	GroupId int  `json:"groupId"`
	Accept  bool `json:"accept"`
}

type AddEventOption struct {
	GroupId int  `json:"groupId"`
	EventId int  `json:"eventId"`
	Option  bool `json:"option"`
}

type RequestJoinGroup struct {
	GroupId int `json:"groupId"`
}

type RespondToJoinRequest struct {
	GroupId    int  `json:"groupId"`
	UserId     int  `json:"userId"`
	IsAccepted bool `json:"isAccepted"`
}

type AddGroupComment struct {
	PostId int    `json:"postId"`
	Text   string `json:"text"`
	Image  string `json:"image"`
	GroupId int `json:"groupId"`
}

type GetGroupComments struct {
	PostId int `json:"postId"`
	GroupId int `json:"groupId"`
}

type ReactToGroupPost struct {
	PostId   int   `json:"postId"`
	GroupId   int   `json:"groupId"`
	Reaction *bool `json:"reaction"`
}

type GetGroupPost struct {
	PostId int `json:"postId"`
}

type RequestFollow struct {
	ProfileId int `json:"profileId"`
}

type AcceptFollow struct {
	ProfileId int `json:"profileId"`
}

type DeleteFollow struct {
	ProfileId  int  `json:"profileId"`
	IsFollower bool `json:"isFollower"`
}

type GetMessages struct {
	Id      int  `json:"id"`
	IsGroup bool `json:"isGroup"`
}

type AddMessage struct {
	Id      int    `json:"id"`
	IsGroup bool   `json:"isGroup"`
	Message string `json:"message"`
}

type DeleteFollowNotification struct {
	ProfileId int `json:"profileId"`
}

type DeleteNewEventNotification struct {
	GroupId int `json:"groupId"`
}
