package controller

import (
	"log"
	"real-time-forum/pkg/model"
)

func (s *Server) AddGroupComment(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "newGroupComment",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var postId float64
	var text, image string
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

	// Validate text
	textRaw, ok := request["text"]
	if !ok {
		response.Error = "Missing 'text' field"
		return response
	}
	text, ok = textRaw.(string)
	if !ok {
		response.Error = "'text' must be a string"
		return response
	}

	imageRaw, ok := request["image"]
	if !ok {
		response.Error = "Missing 'image' field"
		return response
	}
	image, ok = imageRaw.(string)
	if !ok {
		response.Error = "'image' must be a string"
		return response
	}

	if text == "" && image == "" {
		response.Error = "Comment text cannot be empty"
		return response
	}

	if len(text) > 500 {
		response.Error = "Comment text exceeds maximum length of 500 characters"
		return response
	}

	// Check if user is member of the group that owns this post
	isMember, err := s.repository.Group().IsGroupPostMember(res.Userid, int(postId))
	if err != nil || !isMember {
		response.Error = "You are not a member of this group"
		return response
	}

	// Create comment
	comment := &model.Comment{
		UserId: res.Userid,
		PostId: int(postId),
		Text:   text,
		Image:  image,
		Author: res.User.Username,
	}

	if len(comment.Text) > 10000 {
		log.Println("Error adding group comment:")
		response.Error = "comment cannot be too large: "
		return response
	}

	// Add comment to database
	err = s.repository.Group().AddGroupComment(comment)
	if err != nil {
		log.Println("Error adding group comment:", err)
		response.Error = "Error adding comment: " + err.Error()
		return response
	}

	// Get the updated comments for the post
	comments, err := s.repository.Group().GetGroupCommentsByPostId(int(postId))
	if err != nil {
		log.Println("Error getting group comments:", err)
		response.Error = "Error getting comments: " + err.Error()
		return response
	}

	// Get post data to return with comments
	post, err := s.repository.Group().GetGroupPostById(res.Userid, int(postId))
	if err != nil {
		log.Println("Error getting group post data:", err)
		response.Error = "Error getting post data: " + err.Error()
		return response
	}

	post.Comment = comments
	response.Posts = []*model.Post{post}
	return response
}

func (s *Server) GetGroupComments(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "groupComments",
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

	// Get comments for post
	comments, err := s.repository.Group().GetGroupCommentsByPostId(int(postId))
	if err != nil {
		log.Println("Error getting group comments:", err)
		response.Error = "Error getting comments: " + err.Error()
		return response
	}

	// Get post data to return with comments
	post, err := s.repository.Group().GetGroupPostById(res.Userid, int(postId))
	if err != nil {
		log.Println("Error getting group post data:", err)
		response.Error = "Error getting post data: " + err.Error()
		return response
	}

	post.Comment = comments
	response.Posts = []*model.Post{post}
	return response
}
