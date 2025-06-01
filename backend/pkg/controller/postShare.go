package controller

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) GetPostShares(payload *RequestT) any {
	data, ok := payload.data.(*request.GetPostShares)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	user_id := payload.context["user_id"].(int)

	isOwner, err := s.repository.PostShare().VerifyPostOwnership(data.PostId, user_id)
	if err != nil {
		log.Println("Error verifying post ownership:", err)
		return &response.Error{Code: 500, Cause: "Error verifying post ownership"}
	}
	if !isOwner {
		return &response.Error{Code: 403, Cause: "You don't have permission to manage this post"}
	}

	currentShares, err := s.repository.PostShare().GetPostShares(data.PostId)
	if err != nil {
		log.Println("Error getting post shares:", err)
		return &response.Error{Code: 500, Cause: "Error retrieving post shares"}
	}

	availableUsers, err := s.repository.PostShare().GetAvailableUsersToShare(data.PostId, user_id)
	if err != nil {
		log.Println("Error getting available users:", err)
		return &response.Error{Code: 500, Cause: "Error retrieving available users"}
	}

	for _, user := range currentShares {
		user.IsAccepted = true
	}
	for _, user := range availableUsers {
		user.IsAccepted = false
	}

	allUsers := append(currentShares, availableUsers...)

	return &response.GetPostShares{
		AllUsers: allUsers,
		Success:  true,
	}
}

func (s *Server) AddPostShare(payload *RequestT) any {
	data, ok := payload.data.(*request.AddPostShare)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	user_id := payload.context["user_id"].(int)

	isOwner, err := s.repository.PostShare().VerifyPostOwnership(data.PostId, user_id)
	if err != nil {
		log.Println("Error verifying post ownership:", err)
		return &response.Error{Code: 500, Cause: "Error verifying post ownership"}
	}
	if !isOwner {
		return &response.Error{Code: 403, Cause: "You don't have permission to manage this post"}
	}

	err = s.repository.PostShare().AddPostShare(data.PostId, data.UserId)
	if err != nil {
		log.Println("Error adding post share:", err)
		return &response.Error{Code: 500, Cause: "Error adding post share"}
	}

	return &response.AddPostShare{
		Message: "User added successfully",
		Success: true,
	}
}

func (s *Server) RemovePostShare(payload *RequestT) any {
	data, ok := payload.data.(*request.RemovePostShare)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	user_id := payload.context["user_id"].(int)

	isOwner, err := s.repository.PostShare().VerifyPostOwnership(data.PostId, user_id)
	if err != nil {
		log.Println("Error verifying post ownership:", err)
		return &response.Error{Code: 500, Cause: "Error verifying post ownership"}
	}
	if !isOwner {
		return &response.Error{Code: 403, Cause: "You don't have permission to manage this post"}
	}

	err = s.repository.PostShare().RemovePostShare(data.PostId, data.UserId)
	if err != nil {
		log.Println("Error removing post share:", err)
		return &response.Error{Code: 500, Cause: "Error removing post share"}
	}

	return &response.RemovePostShare{
		Message: "User removed successfully",
		Success: true,
	}
}
