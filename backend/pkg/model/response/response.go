package response

import (
	"encoding/json"
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
	Code  int    `json:"code,omitempty"`
	Cause string `json:"cause,omitempty"`
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
