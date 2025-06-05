package app

import (
	"log"
	"social-network/pkg/model"
	"social-network/pkg/model/request"
	"social-network/pkg/model/response"
)

func (app *App) ReactToPost(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.ReactToPost)
	if !ok {
		return &response.Error{
			Code: 400, Cause: "Invalid payload type",
		}
	}

	userId := payload.Ctx.Value("user_id").(int)

	err := app.repository.Reaction().UpsertReaction(userId, data.PostId, data.Reaction)
	if err != nil {
		log.Println("Error saving reaction:", err)
		return &response.Error{
			Code: 500, Cause: "Error saving reaction: " + err.Error(),
		}
	}

	counts, err := app.repository.Reaction().GetReactionCounts(data.PostId)
	if err != nil {
		log.Println("Error getting reaction counts:", err)
		return &response.Error{
			Code: 500, Cause: "Error getting reaction counts: " + err.Error(),
		}
	}

	userReaction, err := app.repository.Reaction().GetUserReaction(userId, data.PostId)
	if err != nil {
		log.Println("Error getting user reaction:", err)
		return &response.Error{
			Code: 500, Cause: "Error getting user reaction: " + err.Error(),
		}
	}
	counts.UserReaction = userReaction

	return &response.ReactToPost{
		Userid: userId,
		Post: &model.Post{
			ID:        data.PostId,
			Reactions: counts,
		},
		Success: true,
	}
}
