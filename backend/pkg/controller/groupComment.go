package controller

import (
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) AddGroupComment(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AddGroupComment)
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

	isMember, err := app.repository.Group().IsGroupPostMember(userId, data.PostId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
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

	if len(comment.Text) > 10000 {
		log.Println("Error adding group comment:")
		return &response.Error{Code: 400, Cause: "Comment cannot be too large"}
	}

	err = app.repository.Group().AddGroupComment(comment)
	if err != nil {
		log.Println("Error adding group comment:", err)
		return &response.Error{Code: 500, Cause: "Error adding comment: " + err.Error()}
	}

	comments, err := app.repository.Group().GetGroupCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting group comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := app.repository.Group().GetGroupPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting group post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return &response.AddGroupComment{
		Post: post,
	}
}

func (app *App) GetGroupComments(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetGroupComments)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	isMember, err := app.repository.Group().IsGroupPostMember(userId, data.PostId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
	}

	comments, err := app.repository.Group().GetGroupCommentsByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting group comments:", err)
		return &response.Error{Code: 500, Cause: "Error getting comments: " + err.Error()}
	}

	post, err := app.repository.Group().GetGroupPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting group post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	post.Comment = comments
	return &response.GetGroupComments{
		Post: post,
	}
}
