package controller

import (
	"fmt"
	"log"
	"real-time-forum/pkg/model"
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
