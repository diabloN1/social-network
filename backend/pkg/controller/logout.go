package app

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) Logout(payload *request.RequestT) any {

	session := payload.Ctx.Value("token").(string)
	err := app.repository.Session().RemoveSession(session)
	if err != nil {
		log.Println("Failed to remove session:", err)
	}

	return &response.Logout{
		Message: "Session was removed!",
	}
}
