package repository

import (
	"database/sql"
	"errors"
	"real-time-forum/internal/model"
)

type ReactionRepository struct {
	Repository *Repository
}

func (r *ReactionRepository) UpsertReaction(userId, postId int, isLike *bool) error {
	var exists bool
	err := r.Repository.db.QueryRow("SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1)", postId).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("post does not exist")
	}

	if isLike == nil {
		_, err := r.Repository.db.Exec("DELETE FROM post_reactions WHERE user_id = $1 AND post_id = $2", userId, postId)
		return err
	}

	_, err = r.Repository.db.Exec(`
		INSERT INTO post_reactions (user_id, post_id, is_like) 
		VALUES ($1, $2, $3)
		ON CONFLICT(user_id, post_id) 
		DO UPDATE SET is_like = $3`,
		userId, postId, isLike)

	return err
}

func (r *ReactionRepository) GetUserReaction(userId, postId int) (*bool, error) {
	var isLike sql.NullBool
	err := r.Repository.db.QueryRow(
		"SELECT is_like FROM post_reactions WHERE user_id = $1 AND post_id = $2",
		userId, postId,
	).Scan(&isLike)

	if err == sql.ErrNoRows {
		return nil, nil // No reaction
	}

	if err != nil {
		return nil, err
	}

	if !isLike.Valid {
		return nil, nil
	}

	value := isLike.Bool
	return &value, nil
}

func (r *ReactionRepository) GetReactionCounts(postId int) (model.ReactionCounts, error) {
	counts := model.ReactionCounts{}

	err := r.Repository.db.QueryRow(
		"SELECT COUNT(*) FROM post_reactions WHERE post_id = $1 AND is_like = TRUE",
		postId,
	).Scan(&counts.Likes)

	if err != nil {
		return counts, err
	}

	err = r.Repository.db.QueryRow(
		"SELECT COUNT(*) FROM post_reactions WHERE post_id = $1 AND is_like = FALSE",
		postId,
	).Scan(&counts.Dislikes)

	return counts, err
}

func (r *ReactionRepository) GetReactionsForPosts(userId int, postIds []int) (map[int]model.ReactionCounts, error) {
	if len(postIds) == 0 {
		return make(map[int]model.ReactionCounts), nil
	}

	// Initialize result map
	result := make(map[int]model.ReactionCounts)

	// Prepare placeholders for query
	placeholders := ""
	args := make([]interface{}, len(postIds))

	for i, id := range postIds {
		if i > 0 {
			placeholders += ", "
		}
		placeholders += "$" + string(rune('2'+i))
		args[i] = id
	}

	// Get all likes and dislikes counts
	query := `
		SELECT post_id, 
			SUM(CASE WHEN is_like = TRUE THEN 1 ELSE 0 END) as likes,
			SUM(CASE WHEN is_like = FALSE THEN 1 ELSE 0 END) as dislikes
		FROM post_reactions
		WHERE post_id IN (` + placeholders + `)
		GROUP BY post_id
	`

	rows, err := r.Repository.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var postId, likes, dislikes int
		if err := rows.Scan(&postId, &likes, &dislikes); err != nil {
			return nil, err
		}

		result[postId] = model.ReactionCounts{
			Likes:    likes,
			Dislikes: dislikes,
		}
	}

	// Get user's own reactions
	if userId > 0 {
		query = `
			SELECT post_id, is_like
			FROM post_reactions
			WHERE user_id = $1 AND post_id IN (` + placeholders + `)
		`

		args = append([]interface{}{userId}, args...)

		rows, err := r.Repository.db.Query(query, args...)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var postId int
			var isLike sql.NullBool

			if err := rows.Scan(&postId, &isLike); err != nil {
				return nil, err
			}

			counts, exists := result[postId]
			if !exists {
				counts = model.ReactionCounts{}
			}

			if isLike.Valid {
				value := isLike.Bool
				counts.UserReaction = &value
			}

			result[postId] = counts
		}
	}

	// Initialize counts for posts without reactions
	for _, postId := range postIds {
		if _, exists := result[postId]; !exists {
			result[postId] = model.ReactionCounts{
				Likes:    0,
				Dislikes: 0,
			}
		}
	}

	return result, nil
}
