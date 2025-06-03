package app

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) GetPostShares(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetPostShares)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	isOwner, err := app.repository.PostShare().VerifyPostOwnership(data.PostId, userId)
	if err != nil {
		log.Println("Error verifying post ownership:", err)
		return &response.Error{Code: 500, Cause: "Error verifying post ownership"}
	}
	if !isOwner {
		return &response.Error{Code: 403, Cause: "You don't have permission to manage this post"}
	}

	currentShares, err := app.repository.PostShare().GetPostShares(data.PostId)
	if err != nil {
		log.Println("Error getting post shares:", err)
		return &response.Error{Code: 500, Cause: "Error retrieving post shares"}
	}

	availableUsers, err := app.repository.PostShare().GetAvailableUsersToShare(data.PostId, userId)
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

func (app *App) AddPostShare(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AddPostShare)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	isOwner, err := app.repository.PostShare().VerifyPostOwnership(data.PostId, userId)
	if err != nil {
		log.Println("Error verifying post ownership:", err)
		return &response.Error{Code: 500, Cause: "Error verifying post ownership"}
	}
	if !isOwner {
		return &response.Error{Code: 403, Cause: "You don't have permission to manage this post"}
	}

	err = app.repository.PostShare().AddPostShare(data.PostId, data.UserId)
	if err != nil {
		log.Println("Error adding post share:", err)
		return &response.Error{Code: 500, Cause: "Error adding post share"}
	}

	return &response.AddPostShare{
		Message: "User added successfully",
		Success: true,
	}
}

func (app *App) RemovePostShare(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.RemovePostShare)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	isOwner, err := app.repository.PostShare().VerifyPostOwnership(data.PostId, userId)
	if err != nil {
		log.Println("Error verifying post ownership:", err)
		return &response.Error{Code: 500, Cause: "Error verifying post ownership"}
	}
	if !isOwner {
		return &response.Error{Code: 403, Cause: "You don't have permission to manage this post"}
	}

	err = app.repository.PostShare().RemovePostShare(data.PostId, data.UserId)
	if err != nil {
		log.Println("Error removing post share:", err)
		return &response.Error{Code: 500, Cause: "Error removing post share"}
	}

	return &response.RemovePostShare{
		Message: "User removed successfully",
		Success: true,
	}
}
