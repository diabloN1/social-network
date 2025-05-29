package response

import (
	"encoding/json"
)

type Payload struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}
type Data interface{ Type() string }
type Errored interface {
	IamError()
	getCode() int
}
type Error struct {
	Code  int
	Cause string
}

func NewError(code int, cause string) struct{ *Error } {
	return struct{ *Error }{Error: &Error{Code: code, Cause: cause}}
}
func (e *Error) getCode() int { return e.Code }
func (Error) IamError()       {}

func Marchal(data any) (status int, result []byte) {
	r := Payload{Data: data}
	status = 200
	switch v := data.(type) {
	case Errored:
		status = v.getCode()
	case Data:
		r.Type = v.Type()
	}

	result, err := json.Marshal(r)
	if err != nil {
		return 500, []byte("Error When Marshal Response")
	}
	return status, result
}
