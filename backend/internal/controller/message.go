package controller

import (
	"fmt"
	"log"
	"real-time-forum/internal/model"
)


// Old
func (s *Server) UpdateSeenMessage(request map[string]any) {
	m := &model.Message{}
	var ok bool
	var recipientIDFloat, senderIDFloat float64
	
	// Validate recipientid
	recipientIDRaw, ok := request["recipientid"]
	if !ok {
		fmt.Println("Missing 'recipientid' field")
		return
	}
	recipientIDFloat, ok = recipientIDRaw.(float64)
	if !ok {
		fmt.Println("'recipientid' must be a number")
		return
	}
	
	// Validate senderid
	senderIDRaw, ok := request["senderid"]
	if !ok {
		fmt.Println("Missing 'senderid' field")
		return
	}
	senderIDFloat, ok = senderIDRaw.(float64)
	if !ok {
		fmt.Println("'senderid' must be a number")
		return
	}
	
	// Assign after validation
	m.RecipientId = int(recipientIDFloat)
	m.SenderId = int(senderIDFloat)

	err := s.repository.Message().UpdateSeenMessages(m.RecipientId, m.SenderId)
	if err != nil {
		log.Println("Error in updating seen messages!")
	}

}

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
