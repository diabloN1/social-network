package controller

import (
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) ReactToGroupPost(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.ReactToGroupPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)

	isMember, err := app.repository.Group().IsGroupPostMember(userId, data.PostId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
	}

	err = app.repository.Group().UpsertGroupReaction(userId, data.PostId, data.Reaction)
	if err != nil {
		log.Println("Error saving group reaction:", err)
		return &response.Error{Code: 500, Cause: "Error saving reaction: " + err.Error()}
	}

	counts, err := app.repository.Group().GetGroupReactionCounts(data.PostId)
	if err != nil {
		log.Println("Error getting group reaction counts:", err)
		return &response.Error{Code: 500, Cause: "Error getting reaction counts: " + err.Error()}
	}

	userReaction, err := app.repository.Group().GetGroupUserReaction(userId, data.PostId)
	if err != nil {
		log.Println("Error getting group user reaction:", err)
		return &response.Error{Code: 500, Cause: "Error getting user reaction: " + err.Error()}
	}
	counts.UserReaction = userReaction

	post := &model.Post{
		ID:        data.PostId,
		Reactions: counts,
	}

	return &response.ReactToGroupPost{
		Post: post,
	}
}

func (app *App) GetGroupPost(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetGroupPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	isMember, err := app.repository.Group().IsGroupPostMember(userId, data.PostId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
	}

	post, err := app.repository.Group().GetGroupPostById(userId, data.PostId)
	if err != nil {
		log.Println("Error getting group post data:", err)
		return &response.Error{Code: 500, Cause: "Error getting post data: " + err.Error()}
	}

	return &response.GetGroupPost{
		Post: post,
	}
}
