package repository

import (
	"database/sql"
	"errors"
	
	"real-time-forum/pkg/model"
	"time"
)

type PostRepository struct {
	Repository *Repository
}

func (r *PostRepository) Add(p *model.Post) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO posts (privacy, user_id, caption, image) VALUES ($1, $2, $3, $4) RETURNING (id)",
		p.Privacy, p.UserId, p.Caption, p.Image,
	).Scan(&p.ID)
}

func (r *PostRepository) GetPosts(userId, startId int) ([]*model.Post, error) {
	var posts []*model.Post

	query := `SELECT 
				p.id, p.privacy, p.user_id, p.caption, p.image, p.creation_date,
				u.avatar,
				u.firstname,
				u.lastname
				FROM posts p

				LEFT JOIN post_shares ps ON p.id = ps.post_id AND ps.shared_with_user_id = $1
				LEFT JOIN users u ON u.id = p.user_id
				LEFT JOIN followers f ON p.user_id = f.following_id AND f.follower_id = $1

				WHERE (
					p.user_id = $1
					OR (p.privacy = 'public' AND u.is_private = FALSE)
					OR (p.privacy = 'almost-private' AND f.id IS NOT NULL)
					OR (p.privacy = 'private' AND ps.id IS NOT NULL)
					)
					AND (
					$2 = 0 OR p.creation_date < (SELECT creation_date FROM posts WHERE id = $2)
					)
				ORDER BY p.creation_date DESC
				LIMIT 10;`

	rows, err := r.Repository.db.Query(query, userId, startId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	postIds := []int{}

	for rows.Next() {
		post := &model.Post{}
		user := &model.User{}
		if err := rows.Scan(&post.ID, &post.Privacy, &post.UserId, &post.Caption, &post.Image, &post.CreationDate, &user.Avatar, &user.Firstname, &user.Lastname); err != nil {
			return nil, err
		}
		newTime, _ := time.Parse("2006-01-02T15:04:05Z", post.CreationDate)
		post.CreationDate = newTime.Format("2006-01-02 15:04:05")
		post.User = user
		posts = append(posts, post)
		postIds = append(postIds, post.ID)
	}

	if len(posts) == 0 {
		return []*model.Post{}, nil
	}

	reactions, err := r.Repository.Reaction().GetReactionsForPosts(userId, postIds)
	if err != nil {
		return nil, err
	}

	for _, post := range posts {
		if counts, ok := reactions[post.ID]; ok {
			post.Reactions = counts
		}
	}

	return posts, nil
}

func (r *PostRepository) GetProfilePosts(profileId, userId int) ([]*model.Post, error) {
	query := `SELECT p.id, p.image 
				FROM posts p

				LEFT JOIN followers f ON f.follower_id = $1 AND f.following_id = $2 
				LEFT JOIN post_shares ps ON p.id = ps.post_id AND ps.shared_with_user_id = $1
				LEFT JOIN users u ON u.id = p.user_id

				WHERE 
					p.user_id = $2
					AND (
						p.user_id = $1
						OR (p.privacy = 'public' AND u.is_private = FALSE)
						OR ((p.privacy = 'public' OR p.privacy = 'almost-private') AND f.id IS NOT NULL)
						OR (p.privacy = 'private' AND ps.id IS NOT NULL)
					)
				ORDER BY p.creation_date DESC`
	rows, err := r.Repository.db.Query(query, userId, profileId)
	if err != nil {
		return nil, err
	}

	posts := []*model.Post{}
	defer rows.Close()
	for rows.Next() {
		p := &model.Post{}
		if err := rows.Scan(&p.ID, &p.Image); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *PostRepository) GetPostById(userId, postId int) (*model.Post, error) {
	post := &model.Post{}
	user := &model.User{}
	err := r.Repository.db.QueryRow(`SELECT 
				p.id, p.privacy, p.user_id, p.caption, p.image, p.creation_date,
				u.avatar,
				u.firstname,
				u.lastname
				FROM posts p

				LEFT JOIN followers f ON p.user_id = f.following_id AND f.follower_id = $1 AND is_accepted = 1
				LEFT JOIN post_shares ps ON p.id = ps.post_id AND ps.shared_with_user_id = $1
				LEFT JOIN users u ON u.id = p.user_id

				WHERE
					p.id = $2
					AND
					(
						p.user_id = $1
						OR (p.privacy = 'public' AND u.is_private = FALSE)
						OR (p.privacy = 'almost-private' AND f.id IS NOT NULL)
						OR (p.privacy = 'private' AND ps.id IS NOT NULL)
					);`,
		userId, postId).Scan(&post.ID, &post.Privacy, &post.UserId, &post.Caption, &post.Image, &post.CreationDate, &user.Avatar, &user.Firstname, &user.Lastname)
	if err == sql.ErrNoRows {
		return nil, sql.ErrNoRows
	}

	if err != nil {
		return nil, err
	}

	reactions, err := r.Repository.Reaction().GetReactionCounts(post.ID)
	if err != nil {
		return nil, err
	}

	userReaction, err := r.Repository.Reaction().GetUserReaction(userId, post.ID)
	if err != nil {
		return nil, err
	}

	
	reactions.UserReaction = userReaction

	post.Reactions = reactions
	post.User = user
	return post, nil
}

func (r *PostRepository) GetPostsByUserId(u *model.User) ([]*model.Post, error) {
	var posts []*model.Post
	rows, err := r.Repository.db.Query("SELECT id, user_id, author, title, text, creation_date FROM posts WHERE user_id = ? ORDER BY creation_date ASC", u.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		post := &model.Post{}
		err = rows.Scan(&post.ID, &post.UserId, &post.Title, &post.Text, &post.CreationDate)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	if len(posts) == 0 {
		return []*model.Post{}, nil
	}
	return posts, nil

}

func (r *PostRepository) HasAccessToPost(userId, postId int, path string) (bool, error) {

	err := r.Repository.db.QueryRow(`SELECT 
				p.id
				FROM posts p

				LEFT JOIN followers f ON p.user_id = f.following_id AND f.follower_id = $1 AND is_accepted = 1
				LEFT JOIN post_shares ps ON p.id = ps.post_id AND ps.shared_with_user_id = $1
				LEFT JOIN users u ON u.id = p.user_id

				WHERE
						p.id = $2
						AND
						p.image = $3
					AND
					(
						p.user_id = $1
						OR (p.privacy = 'public' AND u.is_private = FALSE)
						OR (p.privacy = 'almost-private' AND f.id IS NOT NULL)
						OR (p.privacy = 'private' AND ps.id IS NOT NULL)
					);`, userId, postId, path).Scan(&userId)

	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, nil
	}

	return true, nil
}

func (r *PostRepository) HasAccessToPostComment(userId, postId int, path string) (bool, error) {
	err := r.Repository.db.QueryRow(`SELECT 
				p.id
				FROM posts p

				LEFT JOIN followers f ON p.user_id = f.following_id AND f.follower_id = $1 AND is_accepted = 1
				LEFT JOIN post_shares ps ON p.id = ps.post_id AND ps.shared_with_user_id = $1
				LEFT JOIN users u ON u.id = p.user_id

				WHERE
					p.id = $2
					AND (SELECT id FROM comments WHERE image = $3 and post_id = $2) IS NOT NULL
					AND
					(
						p.user_id = u.id
						OR (p.privacy = 'public' AND u.is_private = FALSE)
						OR (p.privacy = 'almost-private' AND f.id IS NOT NULL)
						OR (p.privacy = 'private' AND ps.id IS NOT NULL)
					);`, userId, postId, path).Scan(&userId)

	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, nil
	}

	return true, nil
}
