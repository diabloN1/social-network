package controller

import (
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) GetPosts(payload any) any {
	data, ok := payload.(*request.GetPosts)
	if !ok {
		return response.Error{Code: 400, Cause: "Invalid payload type"}

	}

	res := s.ValidateSession(map[string]any{"session": data.Session})
	if res.Error != "" {
		return response.Error{Code: 401, Cause: "Unauthorized"}
	}

	posts, err := s.repository.Post().GetPosts(res.Userid, data.StartId)
	if err != nil {
		log.Println("Error in getting feed data:", err)
		return response.Error{Code: 400, Cause: "Error in getting feed data"}
	}

	return &response.GetPosts{
		Posts:  posts,
		Userid: res.Userid,
	}
}

func (s *Server) GetPostData(payload any) any {
	data, ok := payload.(*request.GetPostData)
	if !ok {
		return response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	res := s.ValidateSession(map[string]any{"session": data.Session})
	if res.Error != "" {
		return response.Error{Code: 401, Cause: "Unauthorized"}
	}

	post, err := s.repository.Post().GetPostById(res.Userid, data.PostId)
	if err != nil {
		log.Println("Error in getting Post Data:", err)
		return response.Error{Code: 400, Cause: "Error in getting post data"}
	}

	count, err := s.repository.Comment().GetCommentCountByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting comment count:", err)
		// Optional: still continue, don't block response on comment count
	}
	post.CommentCount = count

	return &response.GetPostData{
		Userid: res.Userid,
		Posts:  []*model.Post{post},
	}
}


func (s *Server) AddPost(request map[string]any) *model.Response {
	p := &model.Post{}
	u := &model.User{}
	p.User = u
	response := &model.Response{}

	var ok bool
	var caption, privacy, image string

	// Validate text
	captionRaw, ok := request["caption"]
	if !ok {
		response.Error = "Missing 'caption' field"
		return response
	}
	caption, ok = captionRaw.(string)
	if !ok {
		response.Error = "'caption' must be a string"
		return response
	}

	privacyRaw, ok := request["privacy"]
	if !ok {
		response.Error = "Missing 'privacy' field"
		return response
	}
	privacy, ok = privacyRaw.(string)
	if !ok {
		response.Error = "'privacy' must be a string"
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

	if caption == "" && image == "" {
		response.Error = "Can't create empty posts"
		return response
	}

	if privacy != "public" && privacy != "almost-private" && privacy != "private" {
		response.Error = "Privacy must be one of the following : public - almost-private - private"
		return response
	}

	res := s.ValidateSession(request)

	if res.Session == "" {
		response.Error = "Invalid session"
		return response
	}

	// Assign values after validation
	p.UserId = res.Userid
	p.Caption = caption
	p.Privacy = privacy
	p.Image = image
	p.User.Firstname = res.User.Firstname
	p.User.Lastname = res.User.Lastname
	p.User.Avatar = res.User.Avatar

	response.Type = "newPost"

	// Should protect fields . . .
	if len(p.Caption) > 1000 {
		log.Println("Caption exceed limited chars")
		response.Error = "Error text or title exceed limited chars or empty"
		return response
	}

	err := s.repository.Post().Add(p)

	if err != nil {
		response.Error = "Error adding post: " + err.Error()
		return response
	}

	response.Posts = []*model.Post{p}
	return response
}
