package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"real-time-forum/internal/model"
)

type GroupRepository struct {
	Repository *Repository
}

func (r *GroupRepository) Create(g *model.Group) error {
	err := r.Repository.db.QueryRow(
		"INSERT INTO groups (user_id, title, description, image) VALUES ($1, $2, $3, $4) RETURNING (id)",
		g.OwnerId, g.Title, g.Description, g.Image,
	).Scan(&g.ID)

	if err != nil {
		return err
	}

	m := &model.GroupMember{
		UserId:     g.OwnerId,
		GroupId:    g.ID,
		IsAccepted: true,
	}

	err = r.Repository.Group().AddMember(m)
	if err != nil {
		return err
	}

	return nil
}

func (r *GroupRepository) GetGroupOwner(groupId int) (int, error) {
	var ownerId int
	err := r.Repository.db.QueryRow(
		"SELECT COALESCE(user_id, 0) FROM groups WHERE id = $2",
		groupId,
	).Scan(&ownerId)
	if err != nil {
		return 0, err
	}

	return ownerId, nil
}

func (r *GroupRepository) AddMember(m *model.GroupMember) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO group_members (user_id, inviter_id, group_id, is_accepted) VALUES ($1, $2, $3, $4) RETURNING (id)",
		m.UserId, m.InviterId, m.GroupId, m.IsAccepted,
	).Scan(&m.ID)
}

func (r *GroupRepository) GetMember(m *model.GroupMember) error {
	return r.Repository.db.QueryRow(
		"SELECT id FROM group_members WHERE user_id = $1 AND group_id = $2",
		m.UserId, m.GroupId,
	).Scan(&m.ID, &m.IsAccepted)
}

func (r *GroupRepository) AcceptMember(m *model.GroupMember) error {
	_, err := r.Repository.db.Exec(
		"UPDATE group_members SET is_accepted = TRUE WHERE user_id = $1 AND group_id = $2",
		m.UserId, m.GroupId,
	)
	return err
}

func (r *GroupRepository) RemoveMember(m *model.GroupMember) error {
	_, err := r.Repository.db.Exec(
		"DELETE FROM group_members WHERE user_id = $1 AND group_id = $2",
		m.UserId, m.GroupId,
	)
	return err
}

func (r *GroupRepository) AddGroupPost(p *model.Post, groupId int) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO group_posts (group_id, user_id, caption, image) VALUES ($1, $2, $3, $4) RETURNING (id)",
		groupId, p.UserId, p.Caption, p.Image,
	).Scan(&p.ID)
}

func (r *GroupRepository) AddGroupEvent(e *model.GroupEvent, groupId int) error {
	return r.Repository.db.QueryRow(
		"INSERT INTO group_events (group_id, user_id, title, description, option_1, option_2, date, place) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING (id)",
		groupId, e.User.ID, e.Title, e.Description, e.Option1, e.Option2, e.Date, e.Place,
	).Scan(&e.ID)
}

func (r *GroupRepository) AddEventOption(opt *model.EventOption, groupId int) error {
	value, err := r.Repository.Group().getEventOption(opt)
	if err != nil && err != sql.ErrNoRows {
		fmt.Println(err)
		return errors.New("Error loking for option if exists " + err.Error())
	}

	if err != sql.ErrNoRows {
		if opt.IsGoing == value {
			_, err := r.Repository.db.Exec(
				"DELETE FROM event_options WHERE id = $1",
				opt.ID,
			)
			return err
		}
		_, err := r.Repository.db.Exec(
			"UPDATE event_options SET is_going = $1 WHERE id = $2",
			opt.IsGoing, opt.ID,
		)
		return err
	}

	return r.Repository.db.QueryRow(
		"INSERT INTO event_options (event_id, user_id, is_going) VALUES ($1, $2, $3) RETURNING (id)",
		opt.EventId, opt.User.ID, opt.IsGoing,
	).Scan(&opt.ID)
}

func (r *GroupRepository) getEventOption(opt *model.EventOption) (bool, error) {
	var isGoing bool
	err := r.Repository.db.QueryRow(
		"SELECT id, is_going FROM event_options WHERE user_id = $1 AND event_id = $2",
		opt.User.ID, opt.EventId,
	).Scan(&opt.ID, &isGoing)
	return isGoing, err
}

func (r *GroupRepository) GetGroupInvitesByUserId(userId int) ([]*model.Group, error) {
	var groups []*model.Group
	query := `SELECT g.id, g.title, g.image, u.id, u.firstname, u.lastname, u.avatar
				FROM group_members m
				LEFT JOIN groups g ON m.group_id = g.id
				LEFT JOIN users u ON m.inviter_id = u.id
				WHERE m.user_id = $1 AND m.is_accepted = FALSE AND m.inviter_id != 0`
	rows, err := r.Repository.db.Query(query, userId)
	if err != nil {
		fmt.Println("here")
		return nil, err
	}

	for rows.Next() {
		group := &model.Group{}
		inviter := &model.User{}

		if err := rows.Scan(&group.ID, &group.Title, &group.Image, &inviter.ID, &inviter.Firstname, &inviter.Lastname, &inviter.Avatar); err != nil {
		fmt.Println("heree")
			return nil, err
		}

		group.Members = append(group.Members, inviter)
		groups = append(groups, group)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("hereee")
		return nil, err
	}

	return groups, nil
}

func (r *GroupRepository) GetJoinRequestsByOwnerId(ownerId int) ([]*model.Group, error) {
	var groups []*model.Group
	query := `SELECT g.id, g.title, g.image, u.id, u.firstname, u.lastname, u.avatar
				FROM group_members m
				LEFT JOIN groups g ON m.group_id = g.id
				LEFT JOIN users u ON m.user_id = u.id
				WHERE g.user_id = $1 AND m.is_accepted = FALSE AND m.inviter_id = 0`
	rows, err := r.Repository.db.Query(query, ownerId)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		group := &model.Group{}
		user := &model.User{}

		if err := rows.Scan(&group.ID, &group.Title, &group.Image, &user.ID, &user.Firstname, &user.Lastname, &user.Avatar); err != nil {
			return nil, err
		}
		group.Members = append(group.Members, user)
		groups = append(groups, group)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return groups, nil
}

func (r *GroupRepository) GetGroups(userId int) ([]*model.Group, error) {

	var groups []*model.Group
	query := `SELECT g.id, g.user_id, g.title, g.image, COALESCE(m.id, 0) as mId, COALESCE(m.is_accepted, false) as is_accepted
	FROM groups g
	LEFT JOIN group_members m ON m.user_id = $1 AND m.group_id = g.id`

	rows, err := r.Repository.db.Query(query, userId)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		group := &model.Group{}

		var memberId int
		if err := rows.Scan(&group.ID, &group.OwnerId, &group.Title, &group.Image, &memberId, &group.IsAccepted); err != nil {
			return nil, err
		}

		if group.OwnerId == userId {
			group.IsOwner = true
		}

		if memberId != 0 && !group.IsAccepted {
			group.IsPending = true
		}

		groups = append(groups, group)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return groups, nil
}

func (r *GroupRepository) GetGroupData(groupId, userId int) (*model.Group, error) {
	group := &model.Group{}
	member := &model.GroupMember{}
	query := `SELECT g.user_id, g.title, g.description, g.image,   
				COALESCE(m.id, 0) AS member_id, 
				COALESCE(m.inviter_id, 0) AS inviter_id, 
				COALESCE(m.is_accepted, false) AS is_accepted
			FROM groups g
			LEFT JOIN group_members m ON m.user_id = $1 AND m.group_id = $2
			WHERE g.id = $2`

	fmt.Println(groupId, userId)
	err := r.Repository.db.QueryRow(query, userId, groupId).Scan(&group.OwnerId, &group.Title, &group.Description, &group.Image, &member.ID, &member.InviterId, &group.IsAccepted)
	if err != nil {
		return nil, err
	}

	group.IsOwner = group.OwnerId == userId

	if member.ID != 0 && !group.IsAccepted {
		group.IsPending = true
	}

	if !group.IsAccepted {
		group.OwnerId = 0
		group.Description = ""
		return group, nil
	}

	// Get members
	group.Members, err = r.Repository.Group().GetGroupMembers(groupId)
	if err != nil {
		return nil, err
	}

	// Get group posts
	group.Posts, err = r.Repository.Group().GetGroupPosts(groupId)
	if err != nil {
		return nil, err
	}

	// Get group events
	group.Events, err = r.Repository.Group().GetGroupEvents(groupId, userId)
	if err != nil {
		return nil, err
	}

	return group, nil
}

func (r *GroupRepository) GetGroupMembers(groupId int) ([]*model.User, error) {
	var users []*model.User
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar
	FROM group_members m
	LEFT JOIN groups g ON g.id = $1
	LEFT JOIN users u ON u.id = m.user_id
	WHERE m.is_accepted = TRUE AND m.group_id = $1`

	rows, err := r.Repository.db.Query(query, groupId)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		u := &model.User{}

		if err := rows.Scan(&u.ID, &u.Firstname, &u.Lastname, &u.Nickname, &u.Avatar); err != nil {
			return nil, err
		}

		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *GroupRepository) GetGroupPosts(groupId int) ([]*model.Post, error) {
	var posts []*model.Post
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar, p.id, p.caption, p.image, p.creation_date
	FROM group_posts p
	LEFT JOIN groups g ON g.id = p.group_id
	LEFT JOIN users u ON u.id = p.user_id
	WHERE g.id = $1 
	ORDER BY p.creation_date DESC`

	rows, err := r.Repository.db.Query(query, groupId)
	if err != nil {
		return nil, err
	}

	for rows.Next() {

		p := &model.Post{}
		u := &model.User{}

		if err := rows.Scan(&u.ID, &u.Firstname, &u.Lastname, &u.Nickname, &u.Avatar, &p.ID, &p.Caption, &p.Image, &p.CreationDate); err != nil {
			return nil, err
		}

		p.User = u
		posts = append(posts, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *GroupRepository) GetGroupEvents(groupId, userId int) ([]*model.GroupEvent, error) {
	var events []*model.GroupEvent
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar, e.id, e.title, e.description, e.option_1, e.option_2, e.date, e.place, e.creation_date
	FROM group_events e 
	LEFT JOIN groups g ON g.id = e.group_id 
	LEFT JOIN users u ON u.id = e.user_id 
	WHERE g.id = $1 
	ORDER BY e.creation_date DESC`

	rows, err := r.Repository.db.Query(query, groupId)
	if err != nil {
		return nil, err
	}

	for rows.Next() {

		e := &model.GroupEvent{}
		u := &model.User{}

		if err := rows.Scan(&u.ID, &u.Firstname, &u.Lastname, &u.Nickname, &u.Avatar, &e.ID, &e.Title, &e.Description, &e.Option1, &e.Option2, &e.Date, &e.Place, &e.CreationDate); err != nil {
			return nil, err
		}
		e.User = u

		// Get users for each option
		e.Opt1Users, err = r.Repository.Group().GetEventOptionSelectors(e, userId, true)
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}

		e.Opt2Users, err = r.Repository.Group().GetEventOptionSelectors(e, userId, false)
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}

		events = append(events, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

func (r *GroupRepository) GetEventOptionSelectors(e *model.GroupEvent, userId int, option bool) ([]*model.User, error) {
	var users []*model.User
	query := `SELECT u.id, u.firstname, u.lastname, u.nickname, u.avatar 
	FROM event_options o
	INNER JOIN users u ON u.id = o.user_id
	WHERE o.event_id = $1 AND is_going = $2`

	rows, err := r.Repository.db.Query(query, e.ID, option)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		u := &model.User{}

		if err := rows.Scan(&u.ID, &u.Firstname, &u.Lastname, &u.Nickname, &u.Avatar); err != nil {
			return nil, err
		}

		if u.ID == userId {
			if option {
				e.CurrentOption = "option1"
			} else {
				e.CurrentOption = "option2"
			}
		}

		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
