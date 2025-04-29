package controller

import (
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) AddComment(request map[string]any) model.Response {
	c := &model.Comment{}
	response := &model.Response{}
	response.Type = "updatecomments"

	var ok bool
	var userIDFloat, postIDFloat float64
	var text string
	
	// Validate userid
	userIDRaw, ok := request["userid"]
	if !ok {
		response.Error = "Missing 'userid' field"
		return *response
	}
	userIDFloat, ok = userIDRaw.(float64)
	if !ok {
		response.Error = "'userid' must be a number"
		return *response
	}
	
	// Validate postid
	postIDRaw, ok := request["postid"]
	if !ok {
		response.Error = "Missing 'postid' field"
		return *response
	}
	postIDFloat, ok = postIDRaw.(float64)
	if !ok {
		response.Error = "'postid' must be a number"
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
	
	// Assign values after validation
	c.UserId = int(userIDFloat)
	c.PostId = int(postIDFloat)
	c.Text = text
	

	if len(c.Text) > 1000 {
		log.Println("Error comment exceed limited chars")
		response.Error = "Message exceed limited chars"
		return *response
	}

	s.repository.Comment().Add(c)

	response.Postid = c.PostId
	return *response
}
