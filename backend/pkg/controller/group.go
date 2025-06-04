package app

import (
	"database/sql"
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"time"
)

func (app *App) CreateGroup(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.CreateGroup)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)
	g := &model.Group{
		OwnerId:     userId,
		Title:       data.Title,
		Description: data.Description,
		Image:       data.Image,
	}
	err := app.repository.Group().Create(g)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't create group: " + err.Error()}
	}
	return &response.CreateGroup{
		Success: true,
		Group:   g,
	}
}

func (app *App) GetGroups(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)
	groupInvites, err := app.repository.Group().GetGroupInvitesByUserId(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't get group invites: " + err.Error()}
	}
	joinRequests, err := app.repository.Group().GetJoinRequestsByOwnerId(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't get join requests: " + err.Error()}
	}
	allGroups, err := app.repository.Group().GetGroups(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't get groups: " + err.Error()}
	}
	return &response.GetGroups{
		GroupInvites: groupInvites,
		JoinRequests: joinRequests,
		All:          allGroups,
	}
}

func (app *App) GetGroupData(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetGroupData)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)
	group, err := app.repository.Group().GetGroupData(data.GroupId, userId)
	if err != nil {
		return &response.Error{Code: 404, Cause: err.Error()}
	}
	return &response.GetGroupData{
		Group: group,
	}
}

func (app *App) AddGroupPost(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AddGroupPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)
	if data.Caption == "" && data.Image == "" {
		return &response.Error{Code: 400, Cause: "Can't create empty posts"}
	}
	if len(data.Caption) > 1000 {
		return &response.Error{Code: 400, Cause: "Caption exceeds maximum allowed length"}
	}
	user, err := app.repository.User().Find(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error finding user"}
	}
	p := &model.Post{
		UserId:  userId,
		Caption: data.Caption,
		Image:   data.Image,
		User: &model.User{
			Firstname: user.Firstname,
			Lastname:  user.Lastname,
			Avatar:    user.Avatar,
		},
	}
	err = app.repository.Group().AddGroupPost(p, data.GroupId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error adding post: " + err.Error()}
	}
	return &response.AddGroupPost{
		Post: p,
	}
}

func (app *App) AddGroupEvent(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AddGroupEvent)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)
	if data.Title == "" || data.Description == "" || data.Option1 == "" || data.Option2 == "" || data.Date == "" || data.Place == "" {
		return &response.Error{Code: 400, Cause: "Can't create empty events (must fill all required fields)"}
	}
	user, err := app.repository.User().Find(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error finding user"}
	}
	e := &model.GroupEvent{
		UserId:      userId,
		Title:       data.Title,
		Description: data.Description,
		Option1:     data.Option1,
		Option2:     data.Option2,
		Date:        data.Date,
		Place:       data.Place,
		User:        user,
	}
	members, err := app.repository.Group().AddGroupEvent(e, data.GroupId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error adding event: " + err.Error()}
	}

	for _, member := range members {
		if member.ID == e.User.ID {
			continue
		}
		notification := map[string]any{
			"type":      "notifications",
			"message":   "A new group event has been created",
			"timestamp": time.Now().Unix(),
		}
		app.sendNotificationToUser(member.ID, notification)
	}

	return &response.AddGroupEvent{
		Success: true,
		Event:   e,
	}
}

func (app *App) AddEventOption(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AddEventOption)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	user, err := app.repository.User().Find(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error finding user"}
	}

	opt := &model.EventOption{
		EventId: data.EventId,
		IsGoing: data.Option,
		User:    user,
	}

	err = app.repository.Group().AddEventOption(opt, data.GroupId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error adding option: " + err.Error()}
	}

	return &response.AddEventOption{
		Option: opt,
	}
}

func (app *App) RequestJoinGroup(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.RequestJoinGroup)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	m := &model.GroupMember{
		UserId:     userId,
		GroupId:    data.GroupId,
		IsAccepted: false,
	}

	err := app.repository.Group().GetMember(m)
	if err != sql.ErrNoRows {
		return &response.Error{Code: 400, Cause: "Request or membership already exists"}
	}

	if m.ID != 0 {
		return &response.Error{Code: 400, Cause: "Request or membership already exists"}
	}

	err = app.repository.Group().AddMember(m)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error adding member: " + err.Error()}
	}

	ownerId, err := app.repository.Group().GetGroupOwner(m.GroupId)
	if err == nil {
		notification := map[string]any{
			"type":      "notifications",
			"groupId":   m.GroupId,
			"userId":    m.UserId,
			"message":   "New join request to your group",
			"timestamp": time.Now().Unix(),
		}
		app.sendNotificationToUser(ownerId, notification)
	}

	return &response.RequestJoinGroup{
		Success: true,
		Message: "Join request sent",
	}
}

func (app *App) GetJoinRequestCount(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)

	count, err := app.repository.Group().CountPendingJoinRequests(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Database error"}
	}

	return &response.GetJoinRequestCount{
		Count: count,
	}
}

func (app *App) GetUnreadMessagesCountResponse(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)

	pmCount, err := app.repository.Message().CountUnreadPM(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Failed to fetch PM unread count"}
	}

	groupCount, err := app.repository.Message().CountUnreadGroup(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Failed to fetch group unread count"}
	}

	return &response.GetUnreadMessagesCount{
		Count: pmCount + groupCount,
	}
}

func (app *App) RespondToJoinRequest(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.RespondToJoinRequest)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	adminId := payload.Ctx.Value("user_id").(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	m := &model.GroupMember{
		UserId:  data.UserId,
		GroupId: data.GroupId,
	}

	ownerId, err := app.repository.Group().GetGroupOwner(m.GroupId)
	if err != nil || ownerId != adminId {
		return &response.Error{Code: 403, Cause: "You are not the group owner"}
	}

	if data.IsAccepted {
		err := app.repository.Group().AcceptMember(m)
		if err != nil {
			return &response.Error{Code: 500, Cause: "Error accepting member: " + err.Error()}
		}
	} else {
		err := app.repository.Group().RemoveMember(m)
		if err != nil {
			return &response.Error{Code: 500, Cause: "Error removing member: " + err.Error()}
		}
	}

	wsMsg := map[string]any{
		"type": "joinRequestHandled",
	}
	for _, c := range app.clients[adminId] {
		app.ShowMessage(c, wsMsg)
	}
	notification := map[string]any{
		"type":       "notifications",
		"owner": ownerId,
		"message":    "New follow request",
		"timestamp":  time.Now().Unix(),
	}
	app.sendNotificationToUser(ownerId, notification)
	return &response.RespondToJoinRequest{
		Success: true,
		Message: "Join request handled",
	}
}

// GROUP INVITATION METHODS

func (app *App) GetGroupInviteUsers(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.GetGroupInviteUsers)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)
	users, err := app.repository.Group().GetAvailableUsersToInvite(data.GroupId, userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error getting invite users: " + err.Error()}
	}
	return &response.GetGroupInviteUsers{
		Users: users,
	}
}

func (app *App) InviteUserToGroup(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.InviteUserToGroup)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	isMember, err := app.repository.Group().IsMember(userId, data.GroupId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
	}

	err = app.repository.Group().InviteUserToGroup(userId, data.UserId, data.GroupId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error inviting user: " + err.Error()}
	}

	notification := map[string]any{
		"type":      "notifications",
		"groupId":   data.GroupId,
		"inviterId": userId,
		"message":   "You have been invited to join a group",
		"timestamp": time.Now().Unix(),
	}
	app.sendNotificationToUser(data.UserId, notification)

	return &response.InviteUserToGroup{
		Success: true,
		Message: "User invited successfully",
	}
}

func (app *App) RespondToGroupInvitation(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.RespondToGroupInvitation)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	var err error
	var msg string
	if data.Accept {
		err = app.repository.Group().AcceptGroupInvitation(userId, data.GroupId)
		msg = "Invitation accepted"
	} else {
		err = app.repository.Group().RejectGroupInvitation(userId, data.GroupId)
		msg = "Invitation rejected"
	}
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error responding to invitation: " + err.Error()}
	}
notification := map[string]any{
		"type":       "notifications",
		"invited": userId,
		"message":    "New follow request",
		"timestamp":  time.Now().Unix(),
	}
	app.sendNotificationToUser(userId, notification)
	return &response.RespondToGroupInvitation{
		Success: true,
		Message: msg,
	}
}

func (app *App) sendNotificationToUser(userId int, notification map[string]any) {
	app.mu.Lock()
	defer app.mu.Unlock()

	clients, exists := app.clients[userId]
	if !exists {
		return
	}

	for _, client := range clients {
		err := client.Connection.WriteJSON(notification)
		if err != nil {
			log.Printf("Failed to send notification to user %d: %v", userId, err)
		}
	}
}
