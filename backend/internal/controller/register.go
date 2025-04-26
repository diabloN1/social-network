package controller

import (
	"fmt"
	"log"
	"real-time-forum/internal/model"
	"strings"
)

func (s *Server) Register(request map[string]any) model.Response {
	response := model.Response{
		Type: "register",
	}


	var username, password, email string
	
	if usernameRaw, ok := request["username"]; !ok {
		response.Type = "username"
		response.Error = "Missing 'username' field"
		return response
	} else if username, ok = usernameRaw.(string); !ok {
		response.Type = "username"
		response.Error = "'username' must be a string"
		return response
	}
	
	if passwordRaw, ok := request["password"]; !ok {
		response.Type = "password"
		response.Error = "Missing 'password' field"
		return response
	} else if password, ok = passwordRaw.(string); !ok {
		response.Type = "password"
		response.Error = "'password' must be a string"
		return response
	}
	
	if emailRaw, ok := request["email"]; !ok {
		response.Type = "email"
		response.Error = "Missing 'email' field"
		return response
	} else if email, ok = emailRaw.(string); !ok {
		response.Type = "email"
		response.Error = "'email' must be a string"
		return response
	}

	// Input validation
	if !IsUsernameValid(username) {
		fmt.Println(username)
		response.Type = "username"
		response.Error = "Username must be at least 4 characters long and can include letters, numbers, or underscores"
		return response
	}

	if !IsPasswordValid(password) {
		response.Type = "password"
		response.Error = "Password must be at least 6 characters long and include both letters and numbers"
		return response
	}

	if !IsEmailValid(email) {
		response.Type = "email"
		response.Error = "Invalid email format"
		return response
	}

	u := &model.User{
		Username:          username,
		EncryptedPassword: HashPassword(password),
		Email:             email,
	}

	/// Sould handle from here to bellow and login too and handlers go
	err := s.repository.User().Create(u)
	if err != nil {
		if strings.Contains(err.Error(), "User") {
			response.Type = "username"
		} else if strings.Contains(err.Error(), "Email") {
			response.Type = "email"
		}

		response.Error = err.Error()
		return response
	}

	foundUser, err := s.repository.User().Find(u.Username)
	if err != nil {
		log.Println("User was not found: ", err)
		response.Error = "User cannot be found after creation!"
		return response
	}

	session := model.CreateSession(foundUser.ID)

	err = s.repository.Session().Create(session)
	if err != nil {
		log.Println("Failed to create a session:", err)
		response.Error = "Failed to create a session!"
		return response
	}

	response.Error = ""
	response.Session = session.Session
	response.Username = foundUser.Username
	response.Userid = foundUser.ID
	response.Data = ""
	return response
}
