package controller

import (
	"database/sql"
	"fmt"
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) GetPosts(payload any) any {
	data, ok := payload.(*request.GetPosts)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}

	}

	res := s.ValidateSession(map[string]any{"session": data.Session})
	if res.Error != "" {
		return &response.Error{Code: 401, Cause: "Unauthorized"}
	}

	posts, err := s.repository.Post().GetPosts(res.Userid, data.StartId)
	if err != nil {
		log.Println("Error in getting feed data:", err)
		return &response.Error{Code: 400, Cause: "Error in getting feed data"}
	}

	return &response.GetPosts{
		Posts:  posts,
		Userid: res.Userid,
	}
}

func (s *Server) GetPostData(payload any) any {
	data, ok := payload.(*request.GetPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	res := s.ValidateSession(map[string]any{"session": data.Session})
	if res.Error != "" {
		return &response.Error{Code: 401, Cause: res.Error}
	}

	post, err := s.repository.Post().GetPostById(res.Userid, data.PostId)

	if err != nil {
		if err == sql.ErrNoRows {
			return &response.Error{Code: 404, Cause: "Post not found"}
		}
		return &response.Error{Code: 400, Cause: "Error in getting post data"}
	}

	count, err := s.repository.Comment().GetCommentCountByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting comment count:", err)
	}
	post.CommentCount = count
	fmt.Println("post", post)

	return &response.GetPost{
		Userid: res.Userid,
		Post:   post,
	}
}

func (s *Server) AddPost(payload any) any {
	fmt.Println(payload)
	data, ok := payload.(*request.AddPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	if data.Caption == "" && data.Image == "" {
		return &response.Error{Code: 400, Cause: "Can't create empty posts"}
	}

	if data.Privacy != "public" && data.Privacy != "almost-private" && data.Privacy != "private" {
		return &response.Error{Code: 400, Cause: "Invalid privacy setting"}
	}

	res := s.ValidateSession(map[string]any{"session": data.Session})
	if res.Session == "" {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	post := &model.Post{
		UserId:  res.Userid,
		Caption: data.Caption,
		Privacy: data.Privacy,
		Image:   data.Image,
		User: &model.User{
			Firstname: res.User.Firstname,
			Lastname:  res.User.Lastname,
			Avatar:    res.User.Avatar,
		},
	}

	if len(post.Caption) > 1000 {
		return &response.Error{Code: 400, Cause: "Caption exceeds maximum allowed length"}
	}

	err := s.repository.Post().Add(post)
	if err != nil {
		log.Println("Error adding post:", err)
		return &response.Error{Code: 500, Cause: "Error adding post: " + err.Error()}
	}

	return &response.AddPost{
		Post: post,
	}
}
