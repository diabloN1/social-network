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

	res := s.ValidateSession(map[string]any{"session": data.Session})
	if res.Error != "" {
		return &response.Error{
			Code: 400, Cause: "Invalid session",
		}
	}

	err := s.repository.Reaction().UpsertReaction(res.Userid, data.PostId, data.Reaction)
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

	userReaction, err := s.repository.Reaction().GetUserReaction(res.Userid, data.PostId)
	if err != nil {
		log.Println("Error getting user reaction:", err)
		return &response.Error{
			Code: 500, Cause: "Error getting user reaction: " + err.Error(),
		}
	}
	counts.UserReaction = userReaction

	return &response.ReactToPost{
		Userid: res.Userid,
		Post: &model.Post{
			ID:        data.PostId,
			Reactions: counts,
		},
		Success: true,
	}
}
