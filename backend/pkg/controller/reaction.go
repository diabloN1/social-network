package controller

import (
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) ReactToPost(payload *RequestT) any {
	data, ok := payload.data.(*request.ReactToPost)
	if !ok {
		return &response.Error{
			Code: 400, Cause: "Invalid payload type",
		}
	}

	user_id := payload.context["user_id"].(int)

	err := s.repository.Reaction().UpsertReaction(user_id, data.PostId, data.Reaction)
	if err != nil {
		log.Println("Error saving reaction:", err)
		return &response.Error{
			Code: 500, Cause: "Error saving reaction: " + err.Error(),
		}
	}

	counts, err := s.repository.Reaction().GetReactionCounts(data.PostId)
	if err != nil {
		log.Println("Error getting reaction counts:", err)
		return &response.Error{
			Code: 500, Cause: "Error getting reaction counts: " + err.Error(),
		}
	}

	userReaction, err := s.repository.Reaction().GetUserReaction(user_id, data.PostId)
	if err != nil {
		log.Println("Error getting user reaction:", err)
		return &response.Error{
			Code: 500, Cause: "Error getting user reaction: " + err.Error(),
		}
	}
	counts.UserReaction = userReaction

	return &response.ReactToPost{
		Userid: user_id,
		Post: &model.Post{
			ID:        data.PostId,
			Reactions: counts,
		},
		Success: true,
	}
}
