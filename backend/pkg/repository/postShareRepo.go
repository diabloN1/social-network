package repository

import (
	"database/sql"
	"real-time-forum/pkg/model"
)

type PostShareRepository struct {
	Repository *Repository
}

// GetPostShares returns all users who have access to a specific private post
func (r *PostShareRepository) GetPostShares(postId int) ([]*model.User, error) {
	var users []*model.User
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar
			  FROM post_shares ps
			  JOIN users u ON ps.shared_with_user_id = u.id
			  WHERE ps.post_id = $1
			  ORDER BY u.firstname, u.lastname`

	rows, err := r.Repository.db.Query(query, postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		user := &model.User{}
		if err := rows.Scan(&user.ID, &user.Firstname, &user.Lastname, &user.Nickname, &user.Avatar); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// GetAvailableUsersToShare returns followers who don't already have access to the private post
func (r *PostShareRepository) GetAvailableUsersToShare(postId, postOwnerId int) ([]*model.User, error) {
	var users []*model.User
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar
			  FROM users u
			  JOIN followers f ON u.id = f.follower_id
			  WHERE f.following_id = $1 
			  AND f.is_accepted = TRUE
			  AND u.id NOT IN (
				  SELECT ps.shared_with_user_id 
				  FROM post_shares ps 
				  WHERE ps.post_id = $2
			  )
			  ORDER BY u.firstname, u.lastname`

	rows, err := r.Repository.db.Query(query, postOwnerId, postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		user := &model.User{}
		if err := rows.Scan(&user.ID, &user.Firstname, &user.Lastname, &user.Nickname, &user.Avatar); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// AddPostShare adds a user to the post shares
func (r *PostShareRepository) AddPostShare(postId, userId int) error {
	// Check if share already exists
	var existingId int
	checkQuery := `SELECT id FROM post_shares WHERE post_id = $1 AND shared_with_user_id = $2`
	err := r.Repository.db.QueryRow(checkQuery, postId, userId).Scan(&existingId)
	
	if err == nil {
		return nil // Share already exists
	}
	
	if err != sql.ErrNoRows {
		return err
	}

	// Add new share
	query := `INSERT INTO post_shares (post_id, shared_with_user_id) VALUES ($1, $2)`
	_, err = r.Repository.db.Exec(query, postId, userId)
	return err
}

// RemovePostShare removes a user from the post shares
func (r *PostShareRepository) RemovePostShare(postId, userId int) error {
	query := `DELETE FROM post_shares WHERE post_id = $1 AND shared_with_user_id = $2`
	_, err := r.Repository.db.Exec(query, postId, userId)
	return err
}

// VerifyPostOwnership checks if the user owns the post
func (r *PostShareRepository) VerifyPostOwnership(postId, userId int) (bool, error) {
	var ownerId int
	query := `SELECT user_id FROM posts WHERE id = $1`
	err := r.Repository.db.QueryRow(query, postId).Scan(&ownerId)
	
	if err != nil {
		return false, err
	}
	
	return ownerId == userId, nil
}
