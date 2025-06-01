package controller

import (
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) AddComment(payload *RequestT) any {
	data, ok := payload.data.(*request.AddComment)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	if data.Text == "" && data.Image == "" {
		return &response.Error{Code: 400, Cause: "Comment text cannot be empty"}
	}
	if len(data.Text) > 500 {
		return &response.Error{Code: 400, Cause: "Comment text exceeds maximum length of 500 characters"}
	}

	user, err := s.repository.User().Find(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error finding user"}
	}

	comment := &model.Comment{
		UserId: userId,
		PostId: data.PostId,
		Text:   data.Text,
		Image:  data.Image,
		Author: user.Username,
	}

	err = s.repository.Comment().Add(comment)
	if err != nil {
		log.Println("Error adding comment:", err)
		return &response.Error{Code: 500, Cause: "Error adding comment: " + err.Error()}
	}

	comments, err := s.repository.Comment().GetCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := s.repository.Post().GetPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return post
}

func (s *Server) GetComments(payload *RequestT) any {
	data, ok := payload.data.(*request.GetComments)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	comments, err := s.repository.Comment().GetCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := s.repository.Post().GetPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return post
}
