package app

import (
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) GetChat(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)

	privateConvs, err := app.repository.Message().GetPrivateConversations(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	groupConvs, err := app.repository.Message().GetGroupConversations(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	newConvs, err := app.repository.Message().GetNewConversations(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	return &response.GetChat{
		PrivateConvs: privateConvs,
		GroupConvs:   groupConvs,
		NewConvs:     newConvs,
	}
}

func (app *App) GetMessages(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetMessages)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	m := &model.Message{}
	if data.IsGroup {
		m.GroupId = data.Id
	} else {
		m.RecipientId = data.Id
	}
	m.SenderId = userId

	messages, err := app.repository.Message().GetMessages(m)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	app.UpdateSeenMessage(data.IsGroup, userId, data.Id)
	wsMsg := map[string]any{
		"type": "unreadmsgRequestHandled",
	}
	for _, c := range app.clients[userId] {
		app.ShowMessage(c, wsMsg)
	}

	return &response.GetMessages{
		Messages: messages,
	}
}

func (app *App) AddMessage(payload *request.RequestT) (*response.AddMessage, *response.Error) {
	data, ok := payload.Data.(*request.AddMessage)
	if !ok {
		return nil, &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	if len(data.Message) == 0 || len(data.Message) > 1000 || data.Id < 1 {
		return nil, &response.Error{Code: 400, Cause: "Invalid message input"}
	}

	m := &model.Message{}
	if data.IsGroup {
		m.GroupId = data.Id
		notification := map[string]any{
		"type":       "notifications",
		"followerId": m.GroupId,
		"message":    "new message",
	}
	app.sendNotificationToUser(m.RecipientId, notification)
	} else {
		m.RecipientId = data.Id
		notification := map[string]any{
		"type":       "notifications",
		"followerId": m.RecipientId,
		"message":    "new message",
	}
	app.sendNotificationToUser(m.RecipientId, notification)
	}
	m.SenderId = userId
	m.Text = data.Message

	// Should add middleware to validate if user can send message

	err := app.repository.Message().Add(m)
	if err != nil {
		return nil, &response.Error{Code: 500, Cause: err.Error()}
	}

	err = app.repository.Message().AddGroupMessageNotifications(m)
	if err != nil {
		return nil, &response.Error{Code: 500, Cause: err.Error()}
	}
	
	return &response.AddMessage{
		Type:  "addMessage",
		Message: m,
		IsGroup: data.IsGroup,
	}, nil
}
