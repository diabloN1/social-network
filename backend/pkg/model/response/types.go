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

type GetPostShares struct {
	AllUsers []*model.User `json:"all_users"`
	Success  bool          `json:"success"`
}

type AddPostShare struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}

type RemovePostShare struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}

type GetProfile struct {
	User *model.User `json:"user"`
}

type GetProfiles struct {
	FollowRequests []*model.User `json:"followRequests"`
	AllUsers       []*model.User `json:"allUsers"`
	CurrentUser    *model.User   `json:"currentUser"`
}

type SetProfilePrivacy struct {
	Success bool `json:"success"`
}

type AddGroupComment struct {
	Post *model.Post `json:"post"`
}

type GetGroupComments struct {
	Post *model.Post `json:"post"`
}

type ReactToGroupPost struct {
	Post *model.Post `json:"post"`
}

type GetGroupPost struct {
	Post *model.Post `json:"post"`
}

type GetAllNotifications struct {
	Notifications map[string]int `json:"notifications"`
	TotalCount    int            `json:"totalCount"`
}

type CheckNewFollowNotification struct {
	HasNewFollow bool          `json:"hasNewFollow"`
	NewFollowers []*model.User `json:"newFollowers"`
}

type DeleteFollowNotification struct {
	Message string `json:"message"`
}

type DeleteNewEventNotification struct {
	Message string `json:"message"`
}

type CreateGroup struct {
	Success bool         `json:"success"`
	Group   *model.Group `json:"group,omitempty"`
}

type GetGroups struct {
	GroupInvites []*model.Group `json:"groupInvites"`
	JoinRequests []*model.Group `json:"joinRequests"`
	All          []*model.Group `json:"all"`
}

type GetGroupData struct {
	Group *model.Group `json:"group"`
}

type AddGroupPost struct {
	Post *model.Post `json:"post"`
}

type AddGroupEvent struct {
	Success bool              `json:"success"`
	Event   *model.GroupEvent `json:"event,omitempty"`
}

type GetGroupInviteUsers struct {
	Users []*model.User `json:"users"`
}

type InviteUserToGroup struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type RespondToGroupInvitation struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type AddEventOption struct {
	Option *model.EventOption `json:"option"`
}

type RequestJoinGroup struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type GetJoinRequestCount struct {
	Count int `json:"count"`
}

type RespondToJoinRequest struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type GetUnreadMessagesCount struct {
	Count int `json:"count"`
}

type RequestFollow struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type AcceptFollow struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type DeleteFollow struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type GetChat struct {
	PrivateConvs []*model.Conv `json:"privateConvs"`
	GroupConvs   []*model.Conv `json:"groupConvs"`
	NewConvs     []*model.Conv `json:"newConvs"`
}

type GetMessages struct {
	Messages []*model.Message `json:"messages"`
}

type AddMessage struct {
	Type   string         `json:"type"`
	Message *model.Message `json:"message"`
	IsGroup bool           `json:"isGroup"`
}

type Logout struct {
	Message string `json:"message"`
}
