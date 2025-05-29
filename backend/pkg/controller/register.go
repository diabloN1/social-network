package controller

import (
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) Register(payload any) any {
	data, ok := payload.(*request.Register)
	if !ok {
		return response.NewError(400, "Invalid payload type")
	}

	err := data.Validate()
	if err != nil {
		return err
	}

	id, err := s.repository.User().Create(data)
	if err != nil {
		return err
	}
	session, sessionErr := s.repository.Session().Create(id)
	if sessionErr != nil {
		return response.NewError(500, "Failed to create a session!")
	}

	return &response.Login{
		Session: session,
	}
}
