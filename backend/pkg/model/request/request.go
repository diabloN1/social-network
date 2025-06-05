package request

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/pkg/model"
)

type Payload struct {
	Type string `json:"type"`
	Data json.RawMessage
}

type RequestT struct {
	Data        any
	Ctx         context.Context
	Middlewares []func(http.Handler, *RequestT) http.Handler
}

var requestTypes = map[string]any{
	model.TYPE_REGISTER:             &Register{},
	model.TYPE_LOGIN:                &Login{},
	model.Type_GET_POSTS:            &GetPosts{},
	model.Type_GET_POST:             &GetPost{},
	model.Type_ADD_POST:             &AddPost{},
	model.Type_REACT_TO_POST:        &ReactToPost{},
	model.Type_GET_POST_SHARES:      &GetPostShares{},
	model.Type_ADD_POST_SHARE:       &AddPostShare{},
	model.Type_REMOVE_POST_SHARE:    &RemovePostShare{},
	model.Type_ADD_COMMENT:          &AddComment{},
	model.Type_GET_COMMENTS:         &GetComments{},
	model.Type_GET_PROFILE:          &GetProfile{},
	model.Type_GET_PROFILES:         nil,
	model.Type_SET_PROFILE_PRIVACY:  &SetProfilePrivacy{},
	"create-group":                  &CreateGroup{},
	"get-groups":                    nil,
	"get-group-data":                &GetGroupData{},
	"add-group-post":                &AddGroupPost{},
	"add-group-event":               &AddGroupEvent{},
	"invite-user-to-group":          &InviteUserToGroup{},
	"respond-to-group-invitation":   &RespondToGroupInvitation{},
	"get-group-invite-users":        &GetGroupInviteUsers{},
	"add-event-option":              &AddEventOption{},
	"request-join-group":            &RequestJoinGroup{},
	"respond-to-join-request":       &RespondToJoinRequest{},
	"get-join-request-count":        nil,
	"get-unread-messages-count":     nil,
	"add-group-comment":             &AddGroupComment{},
	"get-group-comments":            &GetGroupComments{},
	"react-to-group-post":           &ReactToGroupPost{},
	"get-group-post":                &GetGroupPost{},
	"request-follow":                &RequestFollow{},
	"accept-follow":                 &AcceptFollow{},
	"delete-follow":                 &DeleteFollow{},
	"get-chat":                      nil,
	"get-messages":                  &GetMessages{},
	"add-message":                   &AddMessage{},
	"get-all-notifications":         nil,
	"check-new-follow-notification": nil,
	"delete-follow-notification":    &DeleteFollowNotification{},
	"delete-new-event-notification": &DeleteNewEventNotification{},
	"logout":                        nil,
	"update-seen-message-ws":        &UpdateSeenMessageWS{},
}

func (r Payload) Decode() (string, *RequestT, error) {
	instance, exist := requestTypes[r.Type]
	if !exist {
		return "", nil, fmt.Errorf("invalid request type %s", r.Type)
	}

	if instance != nil {
		err := json.Unmarshal(r.Data, instance)
		if err != nil {
			return "", nil, err
		}
	}

	request := &RequestT{
		Data: instance,
	}

	return r.Type, request, nil
}

func Unmarshal(data []byte) (string, *RequestT, error) {
	request := Payload{}
	err := json.Unmarshal(data, &request)
	if err != nil {
		return "", nil, err
	}
	return request.Decode()
}
