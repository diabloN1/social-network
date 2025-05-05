package controller

import (
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) ValidateSession(request map[string]any) *model.Response {
	response := &model.Response{}
	response.Type = "session"
	response.Error = "error"


	var session string
	if sessionRaw, ok := request["session"]; !ok {
		response.Error = "Missing 'session' field"
		return response
	} else if session, ok = sessionRaw.(string); !ok {
		response.Error = "'session' must be a string"
		return response
	}

	uid, err := s.repository.Session().FindUserIDBySession(session)
	if err != nil {
		log.Println("Session was not found!")
		return response
	}


	foundUser, err := s.repository.User().Find(uid)
	if err != nil {
		log.Println("User was not found!")
		return response
	}

	response.Error = ""
	response.Userid = foundUser.ID
	response.User = foundUser
	response.Session = session

	response.Data = ""
	return response
}

func (s *Server) FindAllUsers(userid int) []*model.User {
	users, err := s.repository.User().GetAll(userid)
	if err != nil {
		log.Println(err)
	}

	for i := 0; i < len(users); i++ {
		if s.findIfUserOnline(users[i].Username) {
			users[i].Online = true
		}
	}
	return users

}
func (s *Server) findIfUserOnline(username string) bool {
	for _, c := range s.clients {
		if c != nil && c.Online {
			if c.Username == username {
				return true
			}
		}
	}
	return false
}

func RemoveUser(users []*model.User, index int) []*model.User {
	return append(users[:index], users[index+1:]...)
}
