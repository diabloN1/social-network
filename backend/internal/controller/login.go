package controller

import (
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) Login(request map[string]any) model.Response {
	response := model.Response{
		Type:  "login",
		Error: "",
	}

	// Validate nickname
	nicknameRaw, ok := request["nickname"]
	if !ok {
		response.Error = "Missing 'nickname' field"
		return response
	}
	username, ok := nicknameRaw.(string)
	if !ok {
		response.Error = "'nickname' must be a string"
		return response
	}

	// Validate password
	passwordRaw, ok := request["password"]
	if !ok {
		response.Error = "Missing 'password' field"
		return response
	}
	password, ok := passwordRaw.(string)
	if !ok {
		response.Error = "'password' must be a string"
		return response
	}

	u := &model.User{
		Username: username,
		Password: password,
	}

	foundUser, err := s.repository.User().Find(u.Username)
	if err != nil {
		log.Println("Failed to find a user:", err)
		response.Error = "Username or password is wrong!"
		return response
	}

	if !ComparePasswords(foundUser.EncryptedPassword, u.Password) {
		response.Error = "Username or password is wrong!"
		return response
	}

	session := model.CreateSession(foundUser.ID)
	err = s.repository.Session().Create(session)
	if err != nil {
		log.Println("Failed to create a session:", err)
		response.Error = "Failed to create a session!"
		return response
	}

	response.Username = foundUser.Username
	response.Userid = foundUser.ID
	response.Session = session.Session
	return response
}
