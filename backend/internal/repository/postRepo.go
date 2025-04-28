package repository

import (
	"errors"
	"real-time-forum/internal/model"
	"time"
)

type PostRepository struct {
	Repository *Repository
}

func (r *PostRepository) Add(p *model.Post) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO posts (privacy, user_id, caption, image) VALUES ($1, $2, $3, $4) RETURNING id",
		p.Privacy, p.UserId, p.Caption, p.Image,
	).Scan(&p.ID)

}

func (r *PostRepository) GetPostsByCategoryId(Id int) ([]*model.Post, error) {
	var posts []*model.Post

	query := "SELECT posts.id, posts.user_id, users.username, posts.title, posts.text, posts.creation_date FROM posts JOIN users ON posts.user_id=users.id WHERE category_id = ? ORDER BY creation_date DESC"

	rows, err := r.Repository.db.Query(query, Id)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		post := &model.Post{}
		if err := rows.Scan(&post.ID, &post.UserId, &post.Author, &post.Title, &post.Text, &post.CreationDate); err != nil {
			return nil, err
		}
		newTime, _ := time.Parse("2006-01-02T15:04:05Z", post.CreationDate)
		post.CreationDate = newTime.Format("2006-01-02 15:04:05")
		post.CategoryID = Id
		posts = append(posts, post)
	}
	if len(posts) == 0 {
		return []*model.Post{}, nil
	}
	return posts, nil
}

func (r *PostRepository) GetPostById(Id int) (*model.Post, error) {
	row := r.Repository.db.QueryRow("SELECT * FROM posts WHERE id = ?", Id)
	post := &model.Post{}
	if err := row.Scan(&post.ID, &post.UserId, &post.Title, &post.Text, &post.CreationDate); err != nil {
		return nil, errors.New(err.Error())
	}
	return post, nil
}

func (r *PostRepository) Edit(p *model.Post) error {
	if _, err := r.Repository.db.Exec("UPDATE posts SET user_id = ?, author = ?, title = ?, text = ?, creation_date = ?, WHERE id = ?",
		p.UserId, p.Title, p.Text, p.CreationDate, p.ID); err != nil {
		return errors.New(err.Error())
	}
	return nil
}

func (r *PostRepository) Delete(p *model.Post) error {
	if _, err := r.Repository.db.Exec("DELETE FROM posts WHERE id = ?", p.ID); err != nil {
		return errors.New(err.Error())
	}
	p = nil
	return nil
}

func (r *PostRepository) GetPostsByUserId(u *model.User) ([]*model.Post, error) {
	var posts []*model.Post
	rows, err := r.Repository.db.Query("SELECT id, user_id, author, title, text, creation_date FROM posts WHERE user_id = ? ORDER BY creation_date ASC", u.ID)
	if err != nil {
		return nil, errors.New(err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		post := &model.Post{}
		err = rows.Scan(&post.ID, &post.UserId, &post.Title, &post.Text, &post.CreationDate)
		if err != nil {
			return nil, errors.New(err.Error())
		}
		posts = append(posts, post)
	}
	if len(posts) == 0 {
		return []*model.Post{}, nil
	}
	return posts, nil

}
