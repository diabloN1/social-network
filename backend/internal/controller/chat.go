package controller

import (
	"fmt"
	"real-time-forum/internal/model"
)

func (s *Server) GetChat(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	privateConvs, err := s.repository.Message().GetPrivateConversations(res.Userid)
	if err != nil {
		fmt.Println(1)
		response["error"] = err.Error()
		return response
	}

	groupConvs, err := s.repository.Message().GetGroupConversations(res.Userid)
	if err != nil {
		fmt.Println(2)
		response["error"] = err.Error()
		return response
	}

	newConvs, err := s.repository.Message().GetNewConversations(res.Userid)
	if err != nil {
		fmt.Println(3)
		response["error"] = err.Error()
		return response
	}

	response["privateConvs"] = privateConvs
	response["groupConvs"] = groupConvs
	response["newConvs"] = newConvs

	return response
}

func (s *Server) GetMessages(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}
	// Validate Inputs
	idRaw, ok := request["id"]
	if !ok {
		response["error"] = "Missing 'id' field"
		return response
	}
	id, ok := idRaw.(float64)
	if !ok {
		response["error"] = "'id' must be a int"
		return response
	}

	isGroupRaw, ok := request["isGroup"]
	if !ok {
		response["error"] = "Missing 'isGroup' field"
		return response
	}
	isGroup, ok := isGroupRaw.(bool)
	if !ok {
		response["error"] = "'isGroup' must be a bool"
		return response
	}

	m := &model.Message{}
	if isGroup {
		m.GroupId = int(id)
	} else {
		m.RecipientId = int(id)
	}
	m.SenderId = res.Userid

	messages, err := s.repository.Message().GetMessages(m)
	if err != nil {
		response["error"] = err.Error()
		return response
	}

	response["messages"] = messages
	s.UpdateSeenMessage(isGroup, res.Userid, int(id))

	return response
}

func (s *Server) AddMessage(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["type"] = "addMessage"
	response["error"] = ""

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	// Validate Inputs
	idRaw, ok := request["id"]
	if !ok {
		response["error"] = "Missing 'id' field"
		return response
	}
	id, ok := idRaw.(float64)
	if !ok {
		response["error"] = "'id' must be a int"
		return response
	}

	isGroupRaw, ok := request["isGroup"]
	if !ok {
		response["error"] = "Missing 'isGroup' field"
		return response
	}
	isGroup, ok := isGroupRaw.(bool)
	if !ok {
		response["error"] = "'isGroup' must be a bool"
		return response
	}

	messageRaw, ok := request["message"]
	if !ok {
		response["error"] = "Missing 'message' field"
		return response
	}
	message, ok := messageRaw.(string)
	if !ok {
		response["error"] = "'message' must be a bool"
		return response
	}

	if len(message) == 0 || len(message) > 1000 || id < 1 {
		response["error"] = "Invalid message input"
		return response
	}

	m := &model.Message{}
	if isGroup {
		m.GroupId = int(id)

	} else {
		m.RecipientId = int(id)
	}
	m.SenderId = res.Userid
	m.Text = message

	/////////// should add middleware to validate if message user can send message

	err := s.repository.Message().Add(m)
	if err != nil {
		response["error"] = err.Error()
		return response
	}
	
	err = s.repository.Message().AddGroupMessageNotifications(m)
	if err != nil {
		response["error"] = err.Error()
		return response
	}

	response["message"] = m
	response["isGroup"] = isGroup

	return response
}
