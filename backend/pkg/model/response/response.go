package response

import (
	"encoding/json"
	"real-time-forum/pkg/model"
)

type Payload struct {
	Type  string `json:"type,omitempty"`
	Data  any    `json:"data,omitempty"`
	Error any    `json:"error,omitempty"`
}
type Errored interface {
	getCode() int
}

type Error struct {
	Code  int    `json:"code"`
	Cause string `json:"cause"`
}

func (e *Error) getCode() int { return e.Code }

func Marshal(data any) (status int, result []byte) {
	r := Payload{}
	status = 200
	switch v := data.(type) {
	case Errored:
		status = v.getCode()
		r.Error = data
	default:
		r.Data = data
	}

	result, err := json.Marshal(r)
	if err != nil {
		return 500, []byte("Error When Marshal Response")
	}
	return status, result
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
