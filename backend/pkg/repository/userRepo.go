package repository

import (
	"database/sql"
	"errors"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"strings"

	"github.com/mattn/go-sqlite3"
)

type UserRepository struct {
	Repository *Repository
}

func (r *UserRepository) Create(u *request.Register) (id int, res *response.RegisterError) {
	res = &response.RegisterError{}
	res.Code = 400
	query := `INSERT INTO users (email, password, firstname, lastname, birth, nickname, avatar, about) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
	err := r.Repository.db.QueryRow(
		query,
		u.Email,
		u.Password,
		u.Firstname,
		u.Lastname,
		u.Birth,
		u.Nickname,
		u.Avatar,
		u.About,
	).Scan(&id)

	if err != nil {
		if sqliteErr, ok := err.(sqlite3.ErrNoExtended); ok {
			if sqliteErr == sqlite3.ErrConstraintUnique {
				switch {
				case strings.Contains(err.Error(), "users.email"):
					res.Code = 400
					res.Field = "email"
					res.Message = "email already taken"
				case strings.Contains(err.Error(), "users.nickname"):
					res.Code = 400
					res.Field = "nickname"
					res.Message = "nickname already taken"
				default:
					res.Code = 400
					res.Message = "unique constraint violation"
				}
				return
			}
		}

		res.Code = 500
		res.Message = "Internal server error"
		return
	}

	return id, nil
}

func (r *UserRepository) Find(identifier interface{}) (*model.User, error) {
	u := &model.User{}
	var query string
	var value interface{}
	switch v := identifier.(type) {
	case int:
		query = "SELECT id, email, password, firstname, lastname, nickname, avatar, birth, about, is_private from users WHERE id = $1"
		value = v
	case string:
		query = "SELECT id, email, password, firstname, lastname, nickname, avatar, birth, about, is_private from users WHERE email = $1"
		value = v
	default:
		return nil, errors.New("invalid identifier type")
	}
	if err := r.Repository.db.QueryRow(query, value).Scan(
		&u.ID,
		&u.Email,
		&u.EncryptedPassword,
		&u.Firstname,
		&u.Lastname,
		&u.Nickname,
		&u.Avatar,
		&u.Birth,
		&u.About,
		&u.IsPrivate); err != nil {
		if err == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}
	return u, nil
}

func (r *UserRepository) GetAllUsers() ([]*model.User, error) {
	var users []*model.User
	query := `SELECT id, firstname, lastname, nickname, avatar FROM users`
	rows, err := r.Repository.db.Query(query)
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

func (r *UserRepository) FindProfile(profileId, userId int) (*model.User, error) {

	var fId int
	var fIsAccepted bool
	query := `SELECT id, is_accepted FROM followers WHERE following_id = $1 AND follower_id = $2`
	if err := r.Repository.db.QueryRow(query, profileId, userId).Scan(
		&fId,
		&fIsAccepted); err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	user, err := r.Repository.User().Find(profileId)
	if profileId == userId {
		user.CurrentUser = true
	}

	if err != nil {
		return nil, err
	}

	isAllowed := user.CurrentUser || !user.IsPrivate || (fId != 0 && fIsAccepted)

	if !isAllowed {
		u := &model.User{}
		u.Firstname = user.Firstname
		u.Lastname = user.Lastname
		u.Nickname = user.Nickname
		u.Avatar = user.Avatar
		u.IsPrivate = user.IsPrivate
		u.Follow.ID = fId
		u.Follow.IsAccepted = fIsAccepted
		return u, nil
	}

	user.Posts, err = r.Repository.Post().GetProfilePosts(profileId, userId)
	if err != nil {
		return nil, err
	}

	// Get following and followers
	user.Followers, err = r.Repository.Follow().GetFollowers(profileId)
	if err != nil {
		return nil, err
	}

	user.Following, err = r.Repository.Follow().GetFollowing(profileId)
	if err != nil {
		return nil, err
	}

	user.Follow.ID = fId
	user.Follow.IsAccepted = fIsAccepted

	return user, nil
}

func (r *UserRepository) GetAll(userid int) ([]*model.User, error) {
	var users []*model.User

	query := `SELECT
			users.id AS user_id,
			users.username,
			COALESCE(MAX(messages.creation_date), 'No messages') AS last_sent_message_date,
			COALESCE(SUM(CASE WHEN messages.is_seen = 0 AND users.id = messages.sender_id THEN 1 ELSE 0 END), 0) AS unseen_messages_count
			FROM
			users
			LEFT JOIN
			messages ON (users.id = messages.sender_id AND messages.recipient_id = $1)
								OR (users.id = messages.recipient_id AND messages.sender_id = $1)
			GROUP BY
			users.id, users.username
			ORDER BY
			CASE
				WHEN MAX(messages.creation_date) IS NOT NULL THEN 0
				ELSE 1
			END,
			last_sent_message_date DESC NULLS LAST,
			users.username COLLATE NOCASE ASC;`

	rows, err := r.Repository.db.Query(query, userid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		user := &model.User{}
		if err := rows.Scan(&user.ID, &user.Username, &user.LastMessageDate, &user.TotalNotifications); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserRepository) FindUsernameByID(userid int) (string, error) {
	username := ""
	query := "SELECT username from users WHERE id = $1"
	if err := r.Repository.db.QueryRow(query, userid).Scan(
		&username); err != nil {
		if err == sql.ErrNoRows {
			return "", sql.ErrNoRows
		}
		return "", err
	}
	return username, nil
}

func (r *UserRepository) SetUserPrivacy(userId int, state bool) error {

	// Accept older follow requests if pravicy set to Public
	if !state {
		query := "UPDATE followers SET is_accepted = TRUE WHERE following_id = $1"
		if _, err := r.Repository.db.Exec(query, userId); err != nil && err != sql.ErrNoRows {
			return err
		}
	}

	query := "UPDATE users SET is_private = $1 WHERE id = $2"
	if _, err := r.Repository.db.Exec(query, state, userId); err != nil {
		return err
	}
	return nil
}
