package request

import (
	"encoding/json"
	"fmt"
	"real-time-forum/pkg/model"
)

type Payload struct {
	Type string `json:"type"`
	Data json.RawMessage
}

var requestTypes = map[string]any{
	model.TYPE_REGISTER:          &Register{},
	model.TYPE_LOGIN:             &Login{},
	model.Type_GET_POSTS:         &GetPosts{},
	model.Type_GET_POST:          &GetPost{},
	model.Type_ADD_POST:          &AddPost{},
	model.Type_REACT_TO_POST:     &ReactToPost{},
	model.Type_GET_POST_SHARES:   &GetPostShares{},
	model.Type_ADD_POST_SHARE:    &AddPostShare{},
	model.Type_REMOVE_POST_SHARE: &RemovePostShare{},
	model.Type_ADD_COMMENT:       &AddComment{},
	model.Type_GET_COMMENTS:      &GetComments{},
}

func (r Payload) Decode() (any, error) {
	instance, exist := requestTypes[r.Type]
	if !exist {
		return nil, fmt.Errorf("invalid request type %s", r.Type)
	}

	err := json.Unmarshal(r.Data, instance)
	if err != nil {
		return nil, err
	}

	return instance, nil
}

func Unmarshal(data []byte) (any, error) {
	request := Payload{}
	err := json.Unmarshal(data, &request)
	if err != nil {
		return nil, err
	}
	return request.Decode()
}
