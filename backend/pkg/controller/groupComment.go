package controller

import (
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) AddGroupComment(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AddGroupComment)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.Context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	if data.Text == "" && data.Image == "" {
		return &response.Error{Code: 400, Cause: "Comment text cannot be empty"}
	}
	if len(data.Text) > 500 {
		return &response.Error{Code: 400, Cause: "Comment text exceeds maximum length of 500 characters"}
	}

	isMember, err := s.repository.Group().IsGroupPostMember(userId, data.PostId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
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

	if len(comment.Text) > 10000 {
		log.Println("Error adding group comment:")
		return &response.Error{Code: 400, Cause: "Comment cannot be too large"}
	}

	err = s.repository.Group().AddGroupComment(comment)
	if err != nil {
		log.Println("Error adding group comment:", err)
		return &response.Error{Code: 500, Cause: "Error adding comment: " + err.Error()}
	}

	comments, err := s.repository.Group().GetGroupCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting group comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := s.repository.Group().GetGroupPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting group post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return &response.AddGroupComment{
		Post: post,
	}
}

func (s *Server) GetGroupComments(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetGroupComments)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.Context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	isMember, err := s.repository.Group().IsGroupPostMember(userId, data.PostId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
	}

	comments, err := s.repository.Group().GetGroupCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting group comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := s.repository.Group().GetGroupPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting group post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return &response.GetGroupComments{
		Post: post,
	}
}
