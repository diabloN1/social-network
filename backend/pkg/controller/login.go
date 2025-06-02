package app

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) Login(payload *request.RequestT) any {
	u, ok := payload.Data.(*request.Login)
	if !ok {
		return &response.Error{
			Code:  400,
			Cause: "Invalid payload type",
		}
	}
	invalidCredError := &response.Error{Code: 400, Cause: "username or password invalid"}
	foundUser, err := app.repository.User().Find(u.Email)
	if err != nil {
		log.Println("Failed to find a user:", err)
		return invalidCredError
	}

	if !ComparePasswords(foundUser.EncryptedPassword, u.Password) {
		return invalidCredError
	}

	session, err := app.repository.Session().Create(foundUser.ID)
	if err != nil {
		log.Println("Failed to create a session:", err)
		return &response.Error{Code: 500, Cause: "Failed to create session"}
	}

	return &response.Login{
		Session:  session,
		UserId:   foundUser.ID,
		Username: foundUser.Username,
	}
}
