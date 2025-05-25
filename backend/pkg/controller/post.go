package controller

import (
	"log"
	"real-time-forum/pkg/model"
)

func (s *Server) GetPosts(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "posts",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var startId float64
	startIdRaw, ok := request["startId"]
	if !ok {
		response.Error = "Missing 'startId' field"
		return response
	}
	startId, ok = startIdRaw.(float64)
	if !ok {
		response.Error = "'startId' must be a float64"
		return response
	}

	posts, err := s.repository.Post().GetPosts(res.Userid, int(startId))

	if err != nil {
		log.Println("Error in getting feed data:", err)
	}

	response.Posts = posts

	return response
}

func (s *Server) GetPostData(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "postData",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var postId float64
	postIdRaw, ok := request["postId"]
	if !ok {
		response.Error = "Missing 'postId' field"
		return response
	}
	postId, ok = postIdRaw.(float64)
	if !ok {
		response.Error = "'startId' must be a float64"
		return response
	}

	post, err := s.repository.Post().GetPostById(res.Userid, int(postId))
	if err != nil {
		response.Error = err.Error()
		log.Println("Error in getting Post Data:", err)
	}

	response.Posts = []*model.Post{post}

	return response
}

func (s *Server) AddPost(request map[string]any) *model.Response {
	p := &model.Post{}
	u := &model.User{}
	p.User = u
	response := &model.Response{}

	var ok bool
	var caption, privacy, image string

	// Validate text
	captionRaw, ok := request["caption"]
	if !ok {
		response.Error = "Missing 'caption' field"
		return response
	}
	caption, ok = captionRaw.(string)
	if !ok {
		response.Error = "'caption' must be a string"
		return response
	}

	privacyRaw, ok := request["privacy"]
	if !ok {
		response.Error = "Missing 'privacy' field"
		return response
	}
	privacy, ok = privacyRaw.(string)
	if !ok {
		response.Error = "'privacy' must be a string"
		return response
	}

	imageRaw, ok := request["image"]
	if !ok {
		response.Error = "Missing 'image' field"
		return response
	}
	image, ok = imageRaw.(string)
	if !ok {
		response.Error = "'image' must be a string"
		return response
	}

	if caption == "" && image == "" {
		response.Error = "Can't create empty posts"
		return response
	}

	if privacy != "public" && privacy != "almost-private" && privacy != "private" {
		response.Error = "Privacy must be one of the following : public - almost-private - private"
		return response
	}

	res := s.ValidateSession(request)

	if res.Session == "" {
		response.Error = "Invalid session"
		return response
	}

	// Assign values after validation
	p.UserId = res.Userid
	p.Caption = caption
	p.Privacy = privacy
	p.Image = image
	p.User.Firstname = res.User.Firstname
	p.User.Lastname = res.User.Lastname
	p.User.Avatar = res.User.Avatar

	response.Type = "newPost"

	// Should protect fields . . .
	if len(p.Caption) > 1000 {
		log.Println("Caption exceed limited chars")
		response.Error = "Error text or title exceed limited chars or empty"
		return response
	}

	err := s.repository.Post().Add(p)

	if err != nil {
		response.Error = "Error adding post: " + err.Error()
		return response
	}

	response.Posts = []*model.Post{p}
	return response
}
