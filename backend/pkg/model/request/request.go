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
	model.TYPE_REGISTER: &Register{},
	model.TYPE_LOGIN:    &Login{},
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
