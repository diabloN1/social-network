package controller

import (
	"fmt"
	"log"
	"real-time-forum/internal/model"
	"strings"
	"time"
)

func (s *Server) Register(request map[string]any) *model.Response {
	response := &model.Response{
		Type: "register",
	}

	// Required fields
	var nickname, password, email, firstName, lastName, dateOfBirth string

	// Optional fields
	var aboutMe, avatar string

	fmt.Println(request)

	// nickname validation (already in the code)
	if nicknameRaw, ok := request["nickname"]; !ok {
		response.Type = "nickname"
		response.Error = "Missing 'nickname' field"
		return response
	} else if nickname, ok = nicknameRaw.(string); !ok {
		response.Type = "nickname"
		response.Error = "'nickname' must be a string"
		return response
	}

	// Password validation (already in the code)
	if passwordRaw, ok := request["password"]; !ok {
		response.Type = "password"
		response.Error = "Missing 'password' field"
		return response
	} else if password, ok = passwordRaw.(string); !ok {
		response.Type = "password"
		response.Error = "'password' must be a string"
		return response
	}

	// Email validation (already in the code)
	if emailRaw, ok := request["email"]; !ok {
		response.Type = "email"
		response.Error = "Missing 'email' field"
		return response
	} else if email, ok = emailRaw.(string); !ok {
		response.Type = "email"
		response.Error = "'email' must be a string"
		return response
	}

	// First Name validation (new)
	if firstNameRaw, ok := request["firstName"]; !ok {
		response.Type = "firstName"
		response.Error = "Missing 'firstName' field"
		return response
	} else if firstName, ok = firstNameRaw.(string); !ok {
		response.Type = "firstName"
		response.Error = "'firstName' must be a string"
		return response
	}

	// Last Name validation (new)
	if lastNameRaw, ok := request["lastName"]; !ok {
		response.Type = "lastName"
		response.Error = "Missing 'lastName' field"
		return response
	} else if lastName, ok = lastNameRaw.(string); !ok {
		response.Type = "lastName"
		response.Error = "'lastNamnicknamee' must be a string"
		return response
	}

	// Date of Birth validation (new)
	if dobRaw, ok := request["dateOfBirth"]; !ok {
		response.Type = "dateOfBirth"
		response.Error = "Missing 'dateOfBirth' field"
		return response
	} else if dateOfBirth, ok = dobRaw.(string); !ok {
		response.Type = "dateOfBirth"
		response.Error = "'dateOfBirth' must be a string"
		return response
	}

	// Optional About Me field (new)
	if aboutMeRaw, ok := request["aboutMe"]; ok {
		if aboutMe, ok = aboutMeRaw.(string); !ok {
			response.Type = "aboutMe"
			response.Error = "'aboutMe' must be a string"
			return response
		}
	}

	// Optional Avatar field (new) - handled as a string (path or URL)
	if avatarRaw, ok := request["avatar"]; ok {
		if avatar, ok = avatarRaw.(string); !ok {
			response.Type = "avatar"
			response.Error = "'avatar' must be a string"
			return response
		}
	}

	// Input validation for existing fields
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

	// Validate first name and last name (new)
	if !IsUsernameValid(firstName) {
		response.Type = "firstName"
		response.Error = "First name is required must be at least 4 chars"
		return response
	}

	if !IsUsernameValid(lastName) {
		response.Type = "lastName"
		response.Error = "Last name is required must be at least 4 chars"
		return response
	}

	// Validate date of birth (new)
	dob, err := time.Parse("2006-01-02", dateOfBirth)
	if err != nil {
		response.Type = "dateOfBirth"
		response.Error = "Invalid date format. Use YYYY-MM-DD"
		return response
	}

	// Check if the date is in the past
	if dob.After(time.Now()) {
		response.Type = "dateOfBirth"
		response.Error = "Date of birth must be in the past"
		return response
	}

	// Create user with all fields
	u := &model.User{
		Username:          nickname,
		EncryptedPassword: HashPassword(password),
		Email:             email,
		Firstname:         firstName,
		Lastname:          lastName,
		Birth:             dob,
		About:             aboutMe,
		Avatar:            avatar,
	}

	// Create the user in the database
	err = s.repository.User().Create(u)
	if err != nil {
		if strings.Contains(err.Error(), "Email") {
			response.Type = "email"
		}

		response.Error = err.Error()
		return response
	}

	// Find the created user
	foundUser, err := s.repository.User().Find(u.Email)
	if err != nil {
		log.Println("User was not found: ", err)
		response.Error = "User cannot be found after creation!"
		return response
	}

	// Create a session for the new user
	session := model.CreateSession(foundUser.ID)

	err = s.repository.Session().Create(session)
	if err != nil {
		log.Println("Failed to create a session:", err)
		response.Error = "Failed to create a session!"
		return response
	}

	// Return success response
	response.Error = ""
	response.Session = session.Session
	response.Userid = foundUser.ID
	response.Data = ""
	return response
}
