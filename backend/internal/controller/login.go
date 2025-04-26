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

	// Validate username
	usernameRaw, ok := request["username"]
	if !ok {
		response.Type = "username"
		response.Error = "Missing 'username' field"
		return response
	}
	username, ok := usernameRaw.(string)
	if !ok {
		response.Type = "username"
		response.Error = "'username' must be a string"
		return response
	}

	// Validate password
	passwordRaw, ok := request["password"]
	if !ok {
		response.Type = "password"
		response.Error = "Missing 'password' field"
		return response
	}
	password, ok := passwordRaw.(string)
	if !ok {
		response.Type = "password"
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
		response.Type = "username"
		response.Error = "Username does not exists!"
		return response
	}

	if !ComparePasswords(foundUser.EncryptedPassword, u.Password) {
		response.Type = "password"
		response.Error = "Password is wrong!"
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
