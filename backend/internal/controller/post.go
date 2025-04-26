package controller

import (
	"log"
	"real-time-forum/internal/model"
)

func (s *Server) AddPost(request map[string]any) model.Response {
	p := &model.Post{}
	response := &model.Response{}

	var ok bool
	var userIDFloat float64
	var title, text string
	
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
	
	// Validate title
	titleRaw, ok := request["title"]
	if !ok {
		response.Error = "Missing 'title' field"
		return *response
	}
	title, ok = titleRaw.(string)
	if !ok {
		response.Error = "'title' must be a string"
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
	p.UserId = int(userIDFloat)
	p.Title = title
	p.Text = text
	

	response.Type = "categories"

	if len(p.Text) > 1000 || len(p.Title) > 50 {
		log.Println("Error text or title exceed limited chars")
		response.Error = "Error text or title exceed limited chars"
		return *response
	} 

	category, err := s.repository.Category().GetCategoryByName(request["category"].(string))

	if err != nil {
		response.Error = "Error in getting category by name:" + err.Error()
		return *response
	}

	p.CategoryID = category.ID
	s.repository.Post().Add(p)

	categories := s.GetCategoryAllData()

	response.Categories = categories
	return *response
}
