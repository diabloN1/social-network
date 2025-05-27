package controller

import (
	"log"
	"real-time-forum/pkg/model"
)

func (s *Server) GetPostShares(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "postShares",
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
		response.Error = "'postId' must be a number"
		return response
	}

	// Verify post ownership
	isOwner, err := s.repository.PostShare().VerifyPostOwnership(int(postId), res.Userid)
	if err != nil {
		response.Error = "Error verifying post ownership"
		log.Println("Error verifying post ownership:", err)
		return response
	}

	if !isOwner {
		response.Error = "You don't have permission to manage this post"
		return response
	}

	// Get current shares
	currentShares, err := s.repository.PostShare().GetPostShares(int(postId))
	if err != nil {
		response.Error = "Error getting post shares"
		log.Println("Error getting post shares:", err)
		return response
	}

	// Get available users to share with
	availableUsers, err := s.repository.PostShare().GetAvailableUsersToShare(int(postId), res.Userid)
	if err != nil {
		response.Error = "Error getting available users"
		log.Println("Error getting available users:", err)
		return response
	}

	// Mark current shares with a flag
	for _, user := range currentShares {
		user.IsAccepted = true // Reuse this field to mark current shares
	}
    
	// Mark available users with a different flag
	for _, user := range availableUsers {
		user.IsAccepted = false // Mark as available to add
	}

	// Combine both lists
	response.AllUsers = append(currentShares, availableUsers...)
	response.Success = true

	return response
}

func (s *Server) AddPostShare(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "addPostShare",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var postId, userId float64
	postIdRaw, ok := request["postId"]
	if !ok {
		response.Error = "Missing 'postId' field"
		return response
	}
	postId, ok = postIdRaw.(float64)
	if !ok {
		response.Error = "'postId' must be a number"
		return response
	}

	userIdRaw, ok := request["userId"]
	if !ok {
		response.Error = "Missing 'userId' field"
		return response
	}
	userId, ok = userIdRaw.(float64)
	if !ok {
		response.Error = "'userId' must be a number"
		return response
	}

	// Verify post ownership
	isOwner, err := s.repository.PostShare().VerifyPostOwnership(int(postId), res.Userid)
	if err != nil {
		response.Error = "Error verifying post ownership"
		log.Println("Error verifying post ownership:", err)
		return response
	}

	if !isOwner {
		response.Error = "You don't have permission to manage this post"
		return response
	}

	// Add the share
	err = s.repository.PostShare().AddPostShare(int(postId), int(userId))
	if err != nil {
		response.Error = "Error adding post share"
		log.Println("Error adding post share:", err)
		return response
	}

	response.Success = true
	response.Data = "User added successfully"

	return response
}

func (s *Server) RemovePostShare(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "removePostShare",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var postId, userId float64
	postIdRaw, ok := request["postId"]
	if !ok {
		response.Error = "Missing 'postId' field"
		return response
	}
	postId, ok = postIdRaw.(float64)
	if !ok {
		response.Error = "'postId' must be a number"
		return response
	}

	userIdRaw, ok := request["userId"]
	if !ok {
		response.Error = "Missing 'userId' field"
		return response
	}
	userId, ok = userIdRaw.(float64)
	if !ok {
		response.Error = "'userId' must be a number"
		return response
	}

	// Verify post ownership
	isOwner, err := s.repository.PostShare().VerifyPostOwnership(int(postId), res.Userid)
	if err != nil {
		response.Error = "Error verifying post ownership"
		log.Println("Error verifying post ownership:", err)
		return response
	}

	if !isOwner {
		response.Error = "You don't have permission to manage this post"
		return response
	}

	// Remove the share
	err = s.repository.PostShare().RemovePostShare(int(postId), int(userId))
	if err != nil {
		response.Error = "Error removing post share"
		log.Println("Error removing post share:", err)
		return response
	}

	response.Success = true
	response.Data = "User removed successfully"

	return response
}
