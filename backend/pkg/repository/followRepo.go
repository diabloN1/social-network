package repository

import (
	"database/sql"
	"fmt"
	"real-time-forum/pkg/model"
)

type FollowRepository struct {
	Repository *Repository
}

func (r *FollowRepository) GetFollowers(profileId int) ([]*model.User, error) {
	var followers []*model.User
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar
	FROM followers f
	JOIN users u ON f.follower_id = u.id AND f.is_accepted = TRUE
	WHERE f.following_id = $1`

	rows, err := r.Repository.db.Query(query, profileId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		u := &model.User{}
		if err := rows.Scan(&u.ID, &u.Firstname, &u.Lastname, &u.Nickname, &u.Avatar); err != nil {
			return nil, err
		}
		followers = append(followers, u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return followers, nil
}

func (r *FollowRepository) GetFollowing(profileId int) ([]*model.User, error) {
	var following []*model.User
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar
	FROM followers f
	JOIN users u ON f.follower_id = $1 AND f.is_accepted = TRUE
	WHERE f.following_id = u.id`

	rows, err := r.Repository.db.Query(query, profileId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		u := &model.User{}
		if err := rows.Scan(&u.ID, &u.Firstname, &u.Lastname, &u.Nickname, &u.Avatar); err != nil {
			return nil, err
		}
		following = append(following, u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return following, nil
}

func (r *FollowRepository) RequestFollow(profileId, userId int) error {
	res, err := r.Repository.User().Find(profileId)
	if err != nil {
		return err
	}

	// Check if no request exists
	query := `SELECT count(*) FROM followers WHERE follower_id = $1 AND following_id = $2`

	var followId int
	err = r.Repository.db.QueryRow(query, userId, profileId).Scan(&followId)

	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if followId != 0 {
		return fmt.Errorf("Follow already exists between the 2 users")
	}

	var id int

	query = `INSERT INTO followers (follower_id, following_id, is_accepted) VALUES ($1, $2, $3) RETURNING id`
	err = r.Repository.db.QueryRow(query, userId, profileId, !res.IsPrivate).Scan(&id)

	if !res.IsPrivate {
		notifQuery := `INSERT INTO notifications (sender_id, receiver_id, type) VALUES ($1, $2, $3)`
		_, err := r.Repository.db.Exec(notifQuery, userId, profileId, "follow_request")
		if err != nil {
			return fmt.Errorf("Error creating notification for public follow")
		}
	}
	return err
}

func (r *FollowRepository) AcceptFollow(profileId, userId int) error {

	_, err := r.Repository.db.Exec("UPDATE followers SET is_accepted = TRUE WHERE following_id = $1 AND follower_id = $2",
		userId, profileId)
	if err != nil {
		return err
	}

	return nil
}

func (r *FollowRepository) DeleteFollow(profileId, userId int) error {

	query := `DELETE FROM followers WHERE (follower_id = $1 OR following_id = $2)`

	_, err := r.Repository.db.Exec(query, userId, profileId)
	if err != nil {
		return err
	}

	return nil
}

func (r *FollowRepository) GetFollowRequests(userid int) ([]*model.User, error) {
	var users []*model.User

	// Get follow requests
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar
			  FROM users u
			  INNER JOIN followers f 
			  ON u.id = f.follower_id
			  WHERE f.following_id = $1 AND f.is_accepted = FALSE`
	rows, err := r.Repository.db.Query(query, userid)
	if err != nil {
		return nil, err
	}

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

func (r *FollowRepository) GetFollowRequestCount(userId int) (int, error) {
	query := `SELECT COUNT(*) FROM followers WHERE following_id = $1 AND is_accepted = FALSE`

	var count int
	err := r.Repository.db.QueryRow(query, userId).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
