package controller

import (
	"fmt"
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) GetMessages(request map[string]any) model.Response {
	m := &model.Message{}
	response := &model.Response{}
	response.Type = "loadfirstmessages"
	
	var ok bool
	var recipientIDFloat, senderIDFloat float64
	
	// Validate recipientid
	recipientIDRaw, ok := request["recipientid"]
	if !ok {
		response.Error = "Missing 'recipientid' field"
		return *response
	}
	recipientIDFloat, ok = recipientIDRaw.(float64)
	if !ok {
		response.Error = "'recipientid' must be a number"
		return *response
	}
	
	// Validate senderid
	senderIDRaw, ok := request["senderid"]
	if !ok {
		response.Error = "Missing 'senderid' field"
		return *response
	}
	senderIDFloat, ok = senderIDRaw.(float64)
	if !ok {
		response.Error = "'senderid' must be a number"
		return *response
	}
	
	// Assign after validation
	m.RecipientId = int(recipientIDFloat)
	m.SenderId = int(senderIDFloat)

	offsetValue, ok := request["offset"]

	var offset int

	if !ok || offsetValue == nil {
		offset = 0
	} else {
		offset = int(offsetValue.(float64))
	}

	err := s.repository.Message().UpdateSeenMessages(m.RecipientId, m.SenderId)
	if err != nil {
		log.Println("Error with updating seen messages:", err)
	}
	messages, err := s.repository.Message().Get(m.RecipientId, m.SenderId, offset)
	if err != nil {
		log.Println("Error with getting messages:", err)
	}


	response.Userid = m.RecipientId
	response.Messages = messages
	response.Partnerid = m.SenderId
	return *response
}

func (s *Server) AddMessage(request map[string]any) model.Response {
	m := &model.Message{}
	response := &model.Response{}
	response.Type = "newmessage"

	var ok bool
	var recipientIDFloat, senderIDFloat float64
	var text string
	
	// Validate recipientid
	recipientIDRaw, ok := request["recipientid"]
	if !ok {
		response.Error = "Missing 'recipientid' field"
		return *response
	}
	recipientIDFloat, ok = recipientIDRaw.(float64)
	if !ok {
		response.Error = "'recipientid' must be a number"
		return *response
	}
	
	// Validate senderid
	senderIDRaw, ok := request["senderid"]
	if !ok {
		response.Error = "Missing 'senderid' field"
		return *response
	}
	senderIDFloat, ok = senderIDRaw.(float64)
	if !ok {
		response.Error = "'senderid' must be a number"
		return *response
	}
	
	// Validate text
	textRaw, ok := request["text"]
	if !ok {
		response.Error = "Missing 'text' field"
		return *response
	}
	text, ok = textRaw.(string)
	if !ok {
		response.Error = "'text' must be a string"
		return *response
	}
	
	// Assign after validation
	m.RecipientId = int(recipientIDFloat)
	m.SenderId = int(senderIDFloat)
	m.Text = text
	

	if len(m.Text) > 1000 {
		log.Println("Error text or title exceed limited chars")
		response.Error = "Message exceed limited chars"
		return *response
	} 

	err := s.repository.Message().Add(m)
	if err != nil {
		log.Println(err)
	}

	response.Message = m
	sender_username, err := s.repository.User().FindUsernameByID(m.SenderId)
	if err != nil {
		log.Println("Error in finding username:", err)
	}
	recipient_username, err := s.repository.User().FindUsernameByID(m.RecipientId)
	if err != nil {
		log.Println("Error in finding username:", err)
	}

	response.Message.SenderUsername = sender_username
	response.Message.RecipientUsername = recipient_username
	return *response

}

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
