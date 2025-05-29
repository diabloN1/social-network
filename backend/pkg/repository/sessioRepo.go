package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type SessionRepository struct {
	Repository *Repository
}

func (r *SessionRepository) Create(id int) (string, error) {
	session := uuid.NewString()
	expiresAt := time.Now().Add(12000 * time.Second)
	_, err := r.Repository.db.Exec(
		"INSERT INTO sessions (user_id, session, expiresAt) VALUES (?, ?, ?)",
		id,
		session,
		expiresAt,
	)
	if err != nil {
		return "", err
	}
	return session, nil
}

func (r *SessionRepository) FindUserIDBySession(session string) (int, error) {
	var uid int
	query := "SELECT user_id from sessions WHERE session = $1"
	if err := r.Repository.db.QueryRow(query, session).Scan(
		&uid); err != nil {
		if err == sql.ErrNoRows {
			return -1, sql.ErrNoRows
		}
		return -1, err
	}
	return uid, nil
}

func (r *SessionRepository) RemoveSession(session string) error {
	query := "DELETE FROM sessions WHERE session = $1"
	if err := r.Repository.db.QueryRow(query, session).Scan(); err != nil {
		if err == sql.ErrNoRows {
			return nil
		} else {
			return err
		}
	}
	return nil
}
