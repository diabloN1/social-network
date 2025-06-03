package app

import (
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) Register(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.Register)
	if !ok {
		return response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	err := data.Validate()
	if err != nil {
		return err
	}

	id, err := app.repository.User().Create(data)
	if err != nil {
		return err
	}
	session, sessionErr := app.repository.Session().Create(id)
	if sessionErr != nil {
		return response.Error{Code: 500, Cause: "Failed to create a session!"}
	}

	return &response.Login{
		Session: session,
	}
}
