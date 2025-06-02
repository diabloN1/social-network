package controller

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) Logout(payload *request.RequestT) any {

	session := payload.Ctx.Value("token").(string)
	err := s.repository.Session().RemoveSession(session)
	if err != nil {
		log.Println("Failed to remove session:", err)
	}

	return &response.Logout{
		Message: "Session was removed!",
	}
}
