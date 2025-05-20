package controller

import (
	"fmt"
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) UpdateSeenMessage(isGroup bool, currentId, targetId int) {
	m := &model.Message{}

	// Assign after validation
	m.RecipientId = int(currentId)

	if isGroup {
		m.GroupId = int(targetId)
		err := s.repository.Message().UpdateGroupSeenMessages(m)
		if err != nil {
			log.Println("Error in updating seen messages!")
		}
	} else {
		m.SenderId = int(targetId)

		err := s.repository.Message().UpdatePmSeenMessages(m)
		if err != nil {
			log.Println("Error in updating seen messages!")
		}
	}
}

func (s *Server) UpdateSeenMessageWS(request map[string]any) {
	var ok bool

	res := s.ValidateSession(request)

	if res.Error != "" {
		fmt.Println("Error updating seen message:", res.Error)
		return
	}

	// Validate id
	idRaw, ok := request["id"]
	if !ok {
		fmt.Println("Missing 'id' field")
		return
	}
	id, ok := idRaw.(float64)
	if !ok {
		fmt.Println("'id' must be a number")
		return
	}

	// Validate senderid
	isGroupRaw, ok := request["isGroup"]
	if !ok {
		fmt.Println("Missing 'isGroup' field")
		return
	}
	isGroup, ok := isGroupRaw.(bool)
	if !ok {
		fmt.Println("'isGroup' must be a number")
		return
	}

	s.UpdateSeenMessage(isGroup, res.Userid, int(id))
}

// Old
func (s *Server) UpdateIsTyping(request map[string]any) model.Response {
	response := &model.Response{}

	var ok bool
	var recidFloat, partidFloat float64

	recidRaw, ok := request["recipientid"]
	if !ok {
		response.Error = "Missing 'recipientid' field"
		return *response
	}
	recidFloat, ok = recidRaw.(float64)
	if !ok {
		response.Error = "'recipientid' must be a number"
		return *response
	}

	partidRaw, ok := request["senderid"]
	if !ok {
		response.Error = "Missing 'senderid' field"
		return *response
	}
	partidFloat, ok = partidRaw.(float64)
	if !ok {
		response.Error = "'senderid' must be a number"
		return *response
	}

	response.Userid = int(recidFloat)
	response.Partnerid = int(partidFloat)

	senderUsername, err := s.repository.User().FindUsernameByID(response.Partnerid)
	if err != nil {
		log.Println("Error in finding username:", err)
	}

	response.Username = senderUsername
	response.Type = "updatetyping"
	textRaw, ok := request["text"]
	if !ok {
		response.Error = "Missing 'text' field"
		return *response
	}
	text, ok := textRaw.(string)
	if !ok {
		response.Error = "'text' must be a string"
		return *response
	}
	response.Data = text
	return *response
}
