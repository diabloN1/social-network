package controller

import (
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) Login(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "login",
		Error: "",
	}

	// Validate username
	emailRaw, ok := request["email"]
	if !ok {
		response.Type = "email"
		response.Error = "Missing 'email' field"
		return response
	}
	email, ok := emailRaw.(string)
	if !ok {
		response.Type = "email"
		response.Error = "'email' must be a string"
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
		Email: email,
		Password: password,
	}

	foundUser, err := s.repository.User().Find(u.Email)
	if err != nil {
		log.Println("Failed to find a user:", err)
		response.Type = "email"
		response.Error = "Email does not exists!"
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
