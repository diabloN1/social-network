package repository

import (
	"database/sql"
	"errors"
	"real-time-forum/internal/model"
)

type UserRepository struct {
	Repository *Repository
}

func (r *UserRepository) Create(u *model.User) error {

	foundUser, _ := r.Find(u.Username)

	if foundUser != nil {
		return errors.New("User already exists")
	}

	foundUser, _ = r.Find(u.Email)

	if foundUser != nil {
			return errors.New("Email already taken")
	}

	return r.Repository.db.QueryRow(
		"INSERT INTO users (email, password, firstname, lastname, birth, nickname, avatar, about) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
		u.Email,
		u.EncryptedPassword,
		u.Firstname,
		u.Lastname,
		u.Birth,
		u.Username,
		u.Avatar,
		u.About,
	).Scan(&u.ID)
}

func (r *UserRepository) Find(identifier interface{}) (*model.User, error) {
	u := &model.User{}
	var query string
	var value interface{}
	switch v := identifier.(type) {
	case int:
		query = "SELECT id, email, password from users WHERE id = $1"
		value = v
	case string:
		query = "SELECT id, email, password from users WHERE email = $1"
		value = v
	default:
		return nil, errors.New("Invalid identifier type")
	}
	if err := r.Repository.db.QueryRow(query, value).Scan(
		&u.ID,
		&u.Email,
		&u.EncryptedPassword); err != nil {
		if err == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}
	return u, nil
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
