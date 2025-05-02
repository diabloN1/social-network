package repository

import (
	"errors"
	"log"
	"real-time-forum/internal/model"
	"time"
)

type MessageRepository struct {
	Repository *Repository
}

func (r *MessageRepository) Add(m *model.Message) error {
	err := r.Repository.db.QueryRow(
		"INSERT INTO messages (sender_id, recipient_id, is_seen, text) VALUES ($1, $2, $3, $4) RETURNING id, creation_date",
		m.SenderId, m.RecipientId, m.IsSeen, m.Text,
	).Scan(&m.ID, &m.CreationDate)
	if err != nil {
		log.Println("Error returning values:", err)
	}
	newTime, _ := time.Parse("2006-01-02T15:04:05Z", m.CreationDate)
	m.CreationDate = newTime.Format("2006-01-02 15:04:05")
	return err
}

func (r *MessageRepository) GetTotalNotifications(recipient_id int) (int, error) {
	var totalNotifications = 0
	row := r.Repository.db.QueryRow("SELECT COUNT(*) FROM messages where recipient_id = $1 AND is_seen = 0", recipient_id)
	if err := row.Scan(&totalNotifications); err != nil {
		return 0, errors.New(err.Error())
	}
	return totalNotifications, nil
}

func (r *MessageRepository) UpdateSeenMessages(recipieint_id int, sender_id int) error {
	if _, err := r.Repository.db.Exec("UPDATE messages SET is_seen = 1 WHERE recipient_id = $1 AND sender_id = $2",
		recipieint_id, sender_id); err != nil {
		return err
	}
	return nil
}

func (r *MessageRepository) Get(sender_id int, recipient_id int, offset int) ([]*model.Message, error) {
	var messages []*model.Message

	query := `	SELECT *
				FROM (
					SELECT
						messages.id,
						sender_id,
						sender.username,
						recipient_id,
						recipient.username,
						is_seen,
						text,
						creation_date
					FROM
						messages
					JOIN
						users AS sender ON messages.sender_id = sender.id
					JOIN
						users AS recipient ON messages.recipient_id = recipient.id
					WHERE
						(sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
					ORDER BY
						creation_date DESC
					LIMIT 10 OFFSET $3
				) AS subquery
				ORDER BY
					creation_date ASC`

	rows, err := r.Repository.db.Query(query, sender_id, recipient_id, offset)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		message := &model.Message{}
		if err := rows.Scan(&message.ID, &message.SenderId, &message.SenderUsername, &message.RecipientId, &message.RecipientUsername, &message.IsSeen, &message.Text, &message.CreationDate); err != nil {
			return nil, err
		}
		newTime, _ := time.Parse("2006-01-02T15:04:05Z", message.CreationDate)
		message.CreationDate = newTime.Format("2006-01-02 15:04:05")
		messages = append(messages, message)
	}
	if len(messages) == 0 {
		return []*model.Message{}, nil
	}
	return messages, nil
}
