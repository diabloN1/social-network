package repository

import (
	"database/sql"
	"log"
	"real-time-forum/pkg/model"
)

type SessionRepository struct {
	Repository *Repository
}

func (r *SessionRepository) Create(s *model.Session) error {
	_, err := r.Repository.db.Exec(
		"INSERT INTO sessions (user_id, session, expiresAt) VALUES ($1, $2, $3)",
		s.UserID,
		s.Session,
		s.ExpiresAt,
	)
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
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
