package repository

import (
	"real-time-forum/internal/model"
	"time"
)

type CommentRepository struct {
	Repository *Repository
}

func (r *CommentRepository) Add(c *model.Comment) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO comments (user_id, post_id, text) VALUES ($1, $2, $3) RETURNING id",
		c.UserId, c.PostId, c.Text,
	).Scan(&c.ID)
}

func (r *CommentRepository) GetCommentsByPostId(Id int) ([]*model.Comment, error) {
	var comments []*model.Comment

	// Updated query to use firstname and lastname instead of username
	query := `
		SELECT 
			comments.id, 
			comments.user_id, 
			COALESCE(users.firstname || ' ' || users.lastname, '') AS author, 
			comments.post_id, 
			comments.text, 
			comments.creation_date 
		FROM comments 
		JOIN users ON users.id = comments.user_id 
		WHERE post_id = $1 
		ORDER BY comments.creation_date DESC;
	`

	rows, err := r.Repository.db.Query(query, Id)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		comment := &model.Comment{}
		if err := rows.Scan(&comment.ID, &comment.UserId, &comment.Author, &comment.PostId, &comment.Text, &comment.CreationDate); err != nil {
			return nil, err
		}
		newTime, _ := time.Parse("2006-01-02T15:04:05Z", comment.CreationDate)
		comment.CreationDate = newTime.Format("2006-01-02 15:04:05")
		comment.PostId = Id
		comments = append(comments, comment)
	}

	if len(comments) == 0 {
		return []*model.Comment{}, nil
	}
	return comments, nil
}
