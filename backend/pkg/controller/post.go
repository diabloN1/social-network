package controller

import (
	"database/sql"
	"fmt"
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (app *App) GetPosts(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetPosts)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}

	}

	userId := payload.Ctx.Value("user_id").(int)

	posts, err := app.repository.Post().GetPosts(userId, data.StartId)
	if err != nil {
		log.Println("Error in getting feed data:", err)
		return &response.Error{Code: 400, Cause: "Error in getting feed data"}
	}

	return &response.GetPosts{
		Posts:  posts,
		Userid: userId,
	}
}

func (app *App) GetPostData(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId := payload.Ctx.Value("user_id").(int)
	post, err := app.repository.Post().GetPostById(userId, data.PostId)

	if err != nil {
		if err == sql.ErrNoRows {
			return &response.Error{Code: 404, Cause: "Post not found"}
		}
		return &response.Error{Code: 400, Cause: "Error in getting post data"}
	}

	count, err := app.repository.Comment().GetCommentCountByPostId(data.PostId)
	if err != nil {
		log.Println("Error getting comment count:", err)
	}
	post.CommentCount = count
	fmt.Println("post", post)

	return &response.GetPost{
		Userid: userId,
		Post:   post,
	}
}

func (app *App) AddPost(payload *request.RequestT) any {
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

	user, err := app.repository.User().Find(payload.Ctx.Value("user_id").(int))
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

	err = app.repository.Post().Add(post)
	if err != nil {
		log.Println("Error adding post:", err)
		return &response.Error{Code: 500, Cause: "Error adding post: " + err.Error()}
	}

	return &response.AddPost{
		Post: post,
	}
}
