package app

import (
	"log"
	"social-network/pkg/model"
	"social-network/pkg/model/request"
	"social-network/pkg/model/response"
)

func (app *App) AddComment(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AddComment)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	if data.Text == "" && data.Image == "" {
		return &response.Error{Code: 400, Cause: "Comment text cannot be empty"}
	}
	if len(data.Text) > 500 {
		return &response.Error{Code: 400, Cause: "Comment text exceeds maximum length of 500 characters"}
	}

	user, err := app.repository.User().Find(userId)
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

	err = app.repository.Comment().Add(comment)
	if err != nil {
		log.Println("Error adding comment:", err)
		return &response.Error{Code: 500, Cause: "Error adding comment: " + err.Error()}
	}

	comments, err := app.repository.Comment().GetCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := app.repository.Post().GetPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return post
}

func (app *App) GetComments(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetComments)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	comments, err := app.repository.Comment().GetCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := app.repository.Post().GetPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return post
}
