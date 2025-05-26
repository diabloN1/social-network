package controller

import (
	"log"
	"real-time-forum/pkg/model"
)

func (s *Server) ReactToGroupPost(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "groupReaction",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	postIdRaw, ok := request["postId"]
	if !ok {
		response.Error = "Missing 'postId' field"
		return response
	}
	postId, ok := postIdRaw.(float64)
	if !ok {
		response.Error = "'postId' must be a number"
		return response
	}

	reactionRaw, ok := request["reaction"]
	if !ok {
		response.Error = "Missing 'reaction' field"
		return response
	}

	var reaction *bool = nil

	if reactionRaw != nil {
		reactionVal, ok := reactionRaw.(bool)
		if !ok {
			response.Error = "'reaction' must be a boolean or null"
			return response
		}
		reaction = &reactionVal
	}

	// Check if user is member of the group that owns this post
	isMember, err := s.repository.Group().IsGroupPostMember(res.Userid, int(postId))
	if err != nil || !isMember {
		response.Error = "You are not a member of this group"
		return response
	}

	err = s.repository.Group().UpsertGroupReaction(res.Userid, int(postId), reaction)
	if err != nil {
		log.Println("Error saving group reaction:", err)
		response.Error = "Error saving reaction: " + err.Error()
		return response
	}

	counts, err := s.repository.Group().GetGroupReactionCounts(int(postId))
	if err != nil {
		log.Println("Error getting group reaction counts:", err)
		response.Error = "Error getting reaction counts: " + err.Error()
		return response
	}

	// Get user's own reaction
	userReaction, err := s.repository.Group().GetGroupUserReaction(res.Userid, int(postId))
	if err != nil {
		log.Println("Error getting group user reaction:", err)
		response.Error = "Error getting user reaction: " + err.Error()
		return response
	}

	counts.UserReaction = userReaction

	// Create a post object with the reaction counts to return
	post := &model.Post{
		ID:        int(postId),
		Reactions: counts,
	}

	response.Success = true
	response.Posts = []*model.Post{post}

	return response
}

func (s *Server) GetGroupPost(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "groupPost",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var postId float64
	var ok bool

	// Validate postId
	postIdRaw, ok := request["postId"]
	if !ok {
		response.Error = "Missing 'postId' field"
		return response
	}
	postId, ok = postIdRaw.(float64)
	if !ok {
		response.Error = "'postId' must be a float64"
		return response
	}

	// Check if user is member of the group that owns this post
	isMember, err := s.repository.Group().IsGroupPostMember(res.Userid, int(postId))
	if err != nil || !isMember {
		response.Error = "You are not a member of this group"
		return response
	}

	// Get post data
	post, err := s.repository.Group().GetGroupPostById(res.Userid, int(postId))
	if err != nil {
		log.Println("Error getting group post data:", err)
		response.Error = "Error getting post data: " + err.Error()
		return response
	}

	response.Posts = []*model.Post{post}
	return response
}
