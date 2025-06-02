package app

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"time"
)

func (app *App) RequestFollow(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.RequestFollow)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	err := app.repository.Follow().RequestFollow(data.ProfileId, userId)
	if err != nil {
		log.Println("Error requesting follow:", err)
		return &response.Error{Code: 500, Cause: err.Error()}
	}
	notification := map[string]any{
		"type":       "notifications",
		"followerId": userId,
		"message":    "New follow request",
		"timestamp":  time.Now().Unix(),
	}
	app.sendNotificationToUser(data.ProfileId, notification)

	return &response.RequestFollow{
		Success: true,
		Message: "Follow request sent",
	}
}

func (app *App) AcceptFollow(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AcceptFollow)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	err := app.repository.Follow().AcceptFollow(data.ProfileId, userId)
	if err != nil {
		log.Println("Error accepting follow:", err)
		return &response.Error{Code: 500, Cause: err.Error()}
	}
	wsMsg := map[string]any{
		"type": "followRequestHandled",
	}
	for _, c := range app.clients[userId] {
		app.ShowMessage(c, wsMsg)
	}
	return &response.AcceptFollow{
		Success: true,
		Message: "Follow request accepted",
	}
}

func (app *App) DeleteFollow(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.DeleteFollow)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	var err error
	if data.IsFollower {
		err = app.repository.Follow().DeleteFollow(data.ProfileId, userId)
		if err == nil {
			err = app.repository.Follow().DeleteNotif(userId, data.ProfileId)
		}
		notification := map[string]any{
			"type":       "notifications",
			"followerId": userId,
			"message":    "unfollow",
			"timestamp":  time.Now().Unix(),
		}
		app.sendNotificationToUser(data.ProfileId, notification)
	} else {
		err = app.repository.Follow().DeleteFollow(userId, data.ProfileId)
		notification := map[string]any{
			"type":       "notifications",
			"followerId": data.ProfileId,
			"message":    "unfollow",
			"timestamp":  time.Now().Unix(),
		}
		app.sendNotificationToUser(userId, notification)
	}
	if err != nil {
		log.Println("Error deleting follow:", err)
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	return &response.DeleteFollow{
		Success: true,
		Message: "Unfollowed successfully",
	}
}
