package repository

import (
	"real-time-forum/pkg/model"
	"time"
)

func (r *GroupRepository) AddGroupComment(c *model.Comment) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO group_comments (user_id, post_id, text, image) VALUES ($1, $2, $3, $4) RETURNING id",
		c.UserId, c.PostId, c.Text, c.Image,
	).Scan(&c.ID)
}

func (r *GroupRepository) GetGroupCommentsByPostId(postId int) ([]*model.Comment, error) {
	var comments []*model.Comment

	query := `
		SELECT 
			gc.id, 
			gc.user_id, 
			users.avatar,
			COALESCE(users.firstname || ' ' || users.lastname, '') AS author, 
			gc.post_id, 
			gc.text, 
			gc.image,
			gc.creation_date 
		FROM group_comments gc
		JOIN users ON users.id = gc.user_id 
		WHERE gc.post_id = $1 
		ORDER BY gc.creation_date DESC;
	`

	rows, err := r.Repository.db.Query(query, postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		comment := &model.Comment{}
		if err := rows.Scan(&comment.ID, &comment.UserId, &comment.UserAvatar,&comment.Author, &comment.PostId, &comment.Text, &comment.Image, &comment.CreationDate); err != nil {
			return nil, err
		}
		newTime, _ := time.Parse("2006-01-02T15:04:05Z", comment.CreationDate)
		comment.CreationDate = newTime.Format("2006-01-02 15:04:05")
		comment.PostId = postId
		comments = append(comments, comment)
	}

	if len(comments) == 0 {
		return []*model.Comment{}, nil
	}
	return comments, nil
}

func (r *GroupRepository) IsGroupPostMember(userId, postId int) (bool, error) {
	var isMember bool
	query := `
		SELECT EXISTS(
			SELECT 1 
			FROM group_posts gp
			JOIN group_members gm ON gm.group_id = gp.group_id
			WHERE gp.id = $1 AND gm.user_id = $2 AND gm.is_accepted = TRUE
		)`
	err := r.Repository.db.QueryRow(query, postId, userId).Scan(&isMember)
	return isMember, err
}

func (r *GroupRepository) GetGroupPostById(userId, postId int) (*model.Post, error) {
	post := &model.Post{}
	user := &model.User{}

	query := `
		SELECT 
			gp.id, gp.user_id, gp.caption, gp.image, gp.creation_date,
			u.firstname, u.lastname, u.avatar
		FROM group_posts gp
		JOIN users u ON u.id = gp.user_id
		WHERE gp.id = $1
	`

	err := r.Repository.db.QueryRow(query, postId).Scan(
		&post.ID, &post.UserId, &post.Caption, &post.Image, &post.CreationDate,
		&user.Firstname, &user.Lastname, &user.Avatar,
	)
	if err != nil {
		return nil, err
	}

	post.User = user

	// Get reaction counts
	reactions, err := r.GetGroupReactionCounts(postId)
	if err != nil {
		return nil, err
	}

	// Get user's reaction
	userReaction, err := r.GetGroupUserReaction(userId, postId)
	if err != nil {
		return nil, err
	}

	reactions.UserReaction = userReaction
	post.Reactions = reactions

	return post, nil
}
