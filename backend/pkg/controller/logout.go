package app

import (
	"log"
	"social-network/pkg/model/request"
	"social-network/pkg/model/response"
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
