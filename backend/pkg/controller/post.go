package controller

import (
	"database/sql"
	"fmt"
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) GetPosts(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetPosts)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}

	}

	user_id := payload.Context["user_id"].(int)

	posts, err := s.repository.Post().GetPosts(user_id, data.StartId)
	if err != nil {
		log.Println("Error in getting feed data:", err)
		return &response.Error{Code: 400, Cause: "Error in getting feed data"}
	}

	return &response.GetPosts{
		Posts:  posts,
		Userid: user_id,
	}
}

func (s *Server) GetPostData(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	user_id, _ := payload.Context["user_id"].(int)
	post, err := s.repository.Post().GetPostById(user_id, data.PostId)

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
		Userid: user_id,
		Post:   post,
	}
}

func (s *Server) AddPost(payload *request.RequestT) any {
	fmt.Println(payload)
	data, ok := payload.Data.(*request.AddPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	if data.Caption == "" && data.Image == "" {
		return &response.Error{Code: 400, Cause: "Can't create empty posts"}
	}

	if data.Privacy != "public" && data.Privacy != "almost-private" && data.Privacy != "private" {
		return &response.Error{Code: 400, Cause: "Invalid privacy type"}
	}

	user, err := s.repository.User().Find(payload.Context["user_id"].(int))
	if err != nil {
		return &response.Error{Code: 500, Cause: "An error has aquired while finding user"}
	}

	post := &model.Post{
		UserId:  user.ID,
		Caption: data.Caption,
		Privacy: data.Privacy,
		Image:   data.Image,
		User: &model.User{
			Firstname: user.Firstname,
			Lastname:  user.Lastname,
			Avatar:    user.Avatar,
		},
	}

	if len(post.Caption) > 1000 {
		return &response.Error{Code: 400, Cause: "Caption exceeds maximum allowed length"}
	}

	err = s.repository.Post().Add(post)
	if err != nil {
		log.Println("Error adding post:", err)
		return &response.Error{Code: 500, Cause: "Error adding post: " + err.Error()}
	}

	return &response.AddPost{
		Post: post,
	}
}
