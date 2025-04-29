package controller

import (
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) Logout(request map[string]any) *model.Response {

	response := &model.Response{}

	response.Type = "logout"
	response.Session = ""
	response.Data = ""
	response.Error = "Session was removed!"

	var session string
	if sessionRaw, ok := request["session"]; !ok {
		response.Error = "Missing 'session' field"
		return response
	} else if session, ok = sessionRaw.(string); !ok {
		response.Error = "'session' must be a string"
		return response
	}

	err := s.repository.Session().RemoveSession(session)
	if err != nil {
		log.Println("Failed to remove session:", err)
	}

	return response
}
