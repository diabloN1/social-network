package controller

import (
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) GetChat(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)

	privateConvs, err := s.repository.Message().GetPrivateConversations(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	groupConvs, err := s.repository.Message().GetGroupConversations(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	newConvs, err := s.repository.Message().GetNewConversations(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	return &response.GetChat{
		PrivateConvs: privateConvs,
		GroupConvs:   groupConvs,
		NewConvs:     newConvs,
	}
}

func (s *Server) GetMessages(payload *request.RequestT) any {
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

	messages, err := s.repository.Message().GetMessages(m)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	s.UpdateSeenMessage(data.IsGroup, userId, data.Id)
	wsMsg := map[string]any{
		"type": "unreadmsgRequestHandled",
	}
	for _, c := range s.clients[userId] {
		s.ShowMessage(c, wsMsg)
	}

	return &response.GetMessages{
		Messages: messages,
	}
}

func (s *Server) AddMessage(payload *request.RequestT) (*response.AddMessage, *response.Error) {
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
	} else {
		m.RecipientId = data.Id
	}
	m.SenderId = userId
	m.Text = data.Message

	// Should add middleware to validate if user can send message

	err := s.repository.Message().Add(m)
	if err != nil {
		return nil, &response.Error{Code: 500, Cause: err.Error()}
	}

	err = s.repository.Message().AddGroupMessageNotifications(m)
	if err != nil {
		return nil, &response.Error{Code: 500, Cause: err.Error()}
	}

	return &response.AddMessage{
		Message: m,
		IsGroup: data.IsGroup,
	}, nil
}
