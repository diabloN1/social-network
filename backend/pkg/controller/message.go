package app

import (
	"fmt"
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
)

func (app *App) UpdateSeenMessage(isGroup bool, currentId, targetId int) {
	m := &model.Message{}

	// Assign after validation
	m.RecipientId = int(currentId)

	if isGroup {
		m.GroupId = int(targetId)
		err := app.repository.Message().UpdateGroupSeenMessages(m)
		if err != nil {
			log.Println("Error in updating seen messages!")
		}
		notification := map[string]any{
			"type":      "notifications",
			"message":   "SEEN GROUP MESSAGE ",
		}
		app.sendNotificationToUser(m.GroupId , notification)
	} else {
		m.SenderId = int(targetId)

		err := app.repository.Message().UpdatePmSeenMessages(m)
		if err != nil {
			log.Println("Error in updating seen messages!")
		}
		notification := map[string]any{
			"type":      "notifications",
			"message":   "SEEN  MESSAGE ",
		}
		app.sendNotificationToUser(m.RecipientId, notification)
	}
		
}

func (app *App) UpdateSeenMessageWS(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.UpdateSeenMessageWS)
	if !ok {
		fmt.Println("Invalid payload type")
		return nil
	}
	userId, ok := payload.Ctx.Value("user_id").(int)
	if !ok {
		fmt.Println("Invalid session")
		return nil
	}

	app.UpdateSeenMessage(data.IsGroup, userId, data.Id)
	return nil
}
