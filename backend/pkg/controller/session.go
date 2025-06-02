package app

import (
	"log"
	"real-time-forum/pkg/model"
)

func (app *App) ValidateSession(request map[string]any) *model.Response {
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

	uid, err := app.repository.Session().FindUserIDBySession(session)
	if err != nil {
		log.Println("Session was not found!")
		return response
	}

	foundUser, err := app.repository.User().Find(uid)
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
