package controller

import (
	"log"
	"real-time-forum/internal/model"
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
