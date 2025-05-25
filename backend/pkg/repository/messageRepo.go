package repository

import (
	"database/sql"
	"fmt"
	"log"
	"real-time-forum/pkg/model"
	"time"
)

type MessageRepository struct {
	Repository *Repository
}

func (r *MessageRepository) Add(m *model.Message) error {
	err := r.Repository.db.QueryRow(
		"INSERT INTO messages (sender_id, recipient_id, group_id, is_seen, text) VALUES ($1, $2, $3, $4, $5) RETURNING id, creation_date",
		m.SenderId, m.RecipientId, m.GroupId, m.IsSeen, m.Text,
	).Scan(&m.ID, &m.CreationDate)

	if err != nil {
		log.Println("Error adding message:", err)
		return err
	}
	newTime, _ := time.Parse("2006-01-02T15:04:05Z", m.CreationDate)
	m.CreationDate = newTime.Format("2006-01-02 15:04:05")

	u, err := r.Repository.User().Find(m.SenderId)
	m.User = u

	return err
}

func (r *MessageRepository) GetMessages(m *model.Message) ([]*model.Message, error) {
	var messages []*model.Message
	var rows *sql.Rows
	var err error
	if m.RecipientId != 0 {
		rows, err = r.Repository.db.Query(
			`SELECT m.id, m.sender_id, m.recipient_id, m.group_id, m.text, m.creation_date, u.firstname, u.lastname, u.nickname, u.avatar
			FROM messages m 
			LEFT JOIN users u ON m.sender_id = u.id
			WHERE (m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $2 AND m.recipient_id = $1)`,
			m.SenderId, m.RecipientId,
		)
	} else {
		rows, err = r.Repository.db.Query(
			`SELECT m.id, m.sender_id, m.recipient_id, m.group_id, m.text, m.creation_date, u.firstname, u.lastname, u.nickname, u.avatar
			FROM messages m 
			LEFT JOIN users u ON m.sender_id = u.id
			WHERE m.group_id = $1`,
			m.GroupId,
		)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		message := &model.Message{
			User: &model.User{},
		}

		if err := rows.Scan(&message.ID, &message.SenderId, &message.RecipientId, &message.GroupId, &message.Text, &message.CreationDate, &message.User.Firstname, &message.User.Lastname, &message.User.Nickname, &message.User.Avatar); err != nil {
			return nil, err
		}

		if message.SenderId == m.SenderId {
			message.IsOwned = true
		}

		messages = append(messages, message)
	}
	if len(messages) == 0 {
		return []*model.Message{}, nil
	}
	newTime, _ := time.Parse("2006-01-02T15:04:05Z", m.CreationDate)
	m.CreationDate = newTime.Format("2006-01-02 15:04:05")
	return messages, err
}

func (r *MessageRepository) GetPrivateConversations(userId int) ([]*model.Conv, error) {
	var conversations []*model.Conv
	query := `SELECT 
			u.id,
			u.firstname || ' ' || u.lastname AS full_name,
			u.avatar
			FROM messages m
			INNER JOIN users u ON (
			(m.sender_id = $1 AND u.id = m.recipient_id) OR
			(m.recipient_id = $1 AND u.id = m.sender_id)
			)
			WHERE m.group_id = 0
			GROUP BY u.id;
	`
	rows, err := r.Repository.db.Query(query, userId)

	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		conv := &model.Conv{}
		if err := rows.Scan(&conv.UserId, &conv.FullName, &conv.Image); err != nil {
			fmt.Println(err)
			return nil, err
		}
		conv.Unreadcount, err = r.Repository.Message().GetPmUnreadMessages(userId, conv.UserId)
		if err != nil {
			fmt.Println("Error counting pm conv notfi. count:", err)
		}
		conversations = append(conversations, conv)
	}

	if len(conversations) == 0 {
		return []*model.Conv{}, nil
	}

	return conversations, nil
}

func (r *MessageRepository) GetGroupConversations(userId int) ([]*model.Conv, error) {
	var conversations []*model.Conv
	query := `SELECT 
			g.id,
			g.title,
			g.image
			FROM groups g
			JOIN group_members gm ON gm.group_id = g.id
			WHERE gm.user_id = $1
			GROUP BY g.id;
			`
	rows, err := r.Repository.db.Query(query, userId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		conv := &model.Conv{}
		if err := rows.Scan(&conv.GroupId, &conv.FullName, &conv.Image); err != nil {
			return nil, err
		}

		conv.Unreadcount, err = r.Repository.Message().GetGroupUnreadMessages(userId, conv.GroupId)
		if err != nil {
			fmt.Println("Error counting pm conv notfi. count:", err)
		}
		conversations = append(conversations, conv)
	}
	if len(conversations) == 0 {
		return []*model.Conv{}, nil
	}

	return conversations, nil
}

func (r *MessageRepository) GetNewConversations(userId int) ([]*model.Conv, error) {
	var conversations []*model.Conv
	// (current follow u2) OR (u2 follow current AND u2 Public profile)
	query := `SELECT 
				u.id,
				u.firstname || ' ' || u.lastname AS full_name,
				u.avatar
				FROM users u
				LEFT JOIN followers f1 ON f1.follower_id = $1 AND f1.following_id = u.id AND f1.is_accepted = TRUE  
				LEFT JOIN followers f2 ON f2.follower_id = u.id AND f2.following_id = $1 AND f2.is_accepted = TRUE  
				LEFT JOIN messages m ON (
				(m.sender_id = $1 AND m.recipient_id = u.id) OR 
				(m.recipient_id = $1 AND m.sender_id = u.id)
				)
				WHERE 
				(f1.follower_id = $1 OR (f2.follower_id = u.id AND u.is_private = FALSE))  
				AND m.id IS NULL 
				AND u.id != $1 
				GROUP BY u.id;
	`
	rows, err := r.Repository.db.Query(query, userId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		conv := &model.Conv{}
		if err := rows.Scan(&conv.UserId, &conv.FullName, &conv.Image); err != nil {
			return nil, err
		}
		conversations = append(conversations, conv)
	}
	if len(conversations) == 0 {
		return []*model.Conv{}, nil
	}

	return conversations, nil
}

func (r *MessageRepository) UpdatePmSeenMessages(m *model.Message) error {
	if _, err := r.Repository.db.Exec("UPDATE messages SET is_seen = 1 WHERE sender_id = $1 AND recipient_id = $2",
		m.SenderId, m.RecipientId); err != nil {
		return err
	}
	return nil
}

func (r *MessageRepository) UpdateGroupSeenMessages(m *model.Message) error {
	if _, err := r.Repository.db.Exec("UPDATE group_message_notifications SET is_seen = 1 WHERE user_id = $1 AND group_id = $2",
		m.RecipientId, m.GroupId); err != nil {
		return err
	}
	return nil
}

func (r *MessageRepository) AddGroupMessageNotifications(m *model.Message) error {
	users, err := r.Repository.Group().GetGroupMembers(m.GroupId)
	if err != nil {
		return err
	}

	for _, u := range users {
		if u.ID != m.SenderId {
			if _, err := r.Repository.db.Exec("INSERT INTO group_message_notifications (user_id, group_id) values ($1, $2)",
				u.ID, m.GroupId); err != nil {
				return err
			}
		}
	}

	return nil
}

func (r *MessageRepository) GetPmUnreadMessages(currentId, userId int) (int, error) {
	var unreadCount int
	err := r.Repository.db.QueryRow(`
    SELECT COUNT(*) AS unread_count
    FROM messages
    WHERE recipient_id = $1 AND sender_id = $2 AND is_seen = FALSE`,
		currentId, userId).Scan(&unreadCount)

	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		} else {
			return 0, err
		}
	}
	return unreadCount, nil
}

func (r *MessageRepository) GetGroupUnreadMessages(currentId, groupId int) (int, error) {
	var unreadCount int
	err := r.Repository.db.QueryRow(`
    SELECT COUNT(*) AS unread_count
    FROM group_message_notifications
    WHERE user_id = $1 AND group_id = $2 AND is_seen = FALSE`,
		currentId, groupId).Scan(&unreadCount)

	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		} else {
			return 0, err
		}
	}
	return unreadCount, nil
}

func (m *MessageRepository) CountUnreadPM(userId int) (int, error) {
	var count int
	query := "SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND is_seen = false"
	err := m.Repository.db.QueryRow(query, userId).Scan(&count)
	return count, err
}

func (m *MessageRepository) CountUnreadGroup(userId int) (int, error) {
	var count int
	query := "SELECT COUNT(*) FROM group_message_notifications WHERE user_id = $1 AND is_seen = false"
	err := m.Repository.db.QueryRow(query, userId).Scan(&count)
	return count, err
}

// OLD

func (r *MessageRepository) GetTotalNotifications(recipient_id int) (int, error) {
	var totalNotifications = 0
	row := r.Repository.db.QueryRow("SELECT COUNT(*) FROM messages where recipient_id = $1 AND is_seen = 0", recipient_id)
	if err := row.Scan(&totalNotifications); err != nil {
		return 0, err
	}
	return totalNotifications, nil
}
