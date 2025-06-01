package controller

import (
	"database/sql"
	"log"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"time"
)

func (s *Server) CreateGroup(payload *RequestT) any {
	data, ok := payload.data.(*request.CreateGroup)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}
	g := &model.Group{
		OwnerId:     userId,
		Title:       data.Title,
		Description: data.Description,
		Image:       data.Image,
	}
	err := s.repository.Group().Create(g)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't create group: " + err.Error()}
	}
	return &response.CreateGroup{
		Success: true,
		Group:   g,
	}
}

func (s *Server) GetGroups(payload *RequestT) any {
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}
	groupInvites, err := s.repository.Group().GetGroupInvitesByUserId(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't get group invites: " + err.Error()}
	}
	joinRequests, err := s.repository.Group().GetJoinRequestsByOwnerId(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't get join requests: " + err.Error()}
	}
	allGroups, err := s.repository.Group().GetGroups(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Can't get groups: " + err.Error()}
	}
	return &response.GetGroups{
		GroupInvites: groupInvites,
		JoinRequests: joinRequests,
		All:          allGroups,
	}
}

func (s *Server) GetGroupData(payload *RequestT) any {
	data, ok := payload.data.(*request.GetGroupData)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}
	group, err := s.repository.Group().GetGroupData(data.GroupId, userId)
	if err != nil {
		return &response.Error{Code: 404, Cause: err.Error()}
	}
	return &response.GetGroupData{
		Group: group,
	}
}

func (s *Server) AddGroupPost(payload *RequestT) any {
	data, ok := payload.data.(*request.AddGroupPost)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}
	if data.Caption == "" && data.Image == "" {
		return &response.Error{Code: 400, Cause: "Can't create empty posts"}
	}
	if len(data.Caption) > 1000 {
		return &response.Error{Code: 400, Cause: "Caption exceeds maximum allowed length"}
	}
	user, err := s.repository.User().Find(userId)
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
	err = s.repository.Group().AddGroupPost(p, data.GroupId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error adding post: " + err.Error()}
	}
	return &response.AddGroupPost{
		Post: p,
	}
}

func (s *Server) AddGroupEvent(payload *RequestT) any {
	data, ok := payload.data.(*request.AddGroupEvent)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}
	if data.Title == "" || data.Description == "" || data.Option1 == "" || data.Option2 == "" || data.Date == "" || data.Place == "" {
		return &response.Error{Code: 400, Cause: "Can't create empty events (must fill all required fields)"}
	}
	user, err := s.repository.User().Find(userId)
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
	members, err := s.repository.Group().AddGroupEvent(e, data.GroupId)
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
		s.sendNotificationToUser(member.ID, notification)
	}

	return &response.AddGroupEvent{
		Success: true,
		Event:   e,
	}
}

func (s *Server) AddEventOption(payload *RequestT) any {
	data, ok := payload.data.(*request.AddEventOption)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	user, err := s.repository.User().Find(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error finding user"}
	}

	opt := &model.EventOption{
		EventId: data.EventId,
		IsGoing: data.Option,
		User:    user,
	}

	err = s.repository.Group().AddEventOption(opt, data.GroupId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error adding option: " + err.Error()}
	}

	return &response.AddEventOption{
		Option: opt,
	}
}

func (s *Server) RequestJoinGroup(payload *RequestT) any {
	data, ok := payload.data.(*request.RequestJoinGroup)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	m := &model.GroupMember{
		UserId:     userId,
		GroupId:    data.GroupId,
		IsAccepted: false,
	}

	err := s.repository.Group().GetMember(m)
	if err != sql.ErrNoRows {
		return &response.Error{Code: 400, Cause: "Request or membership already exists"}
	}

	if m.ID != 0 {
		return &response.Error{Code: 400, Cause: "Request or membership already exists"}
	}

	err = s.repository.Group().AddMember(m)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error adding member: " + err.Error()}
	}

	ownerId, err := s.repository.Group().GetGroupOwner(m.GroupId)
	if err == nil {
		notification := map[string]any{
			"type":      "notifications",
			"groupId":   m.GroupId,
			"userId":    m.UserId,
			"message":   "New join request to your group",
			"timestamp": time.Now().Unix(),
		}
		s.sendNotificationToUser(ownerId, notification)
	}

	return &response.RequestJoinGroup{
		Success: true,
		Message: "Join request sent",
	}
}

func (s *Server) GetJoinRequestCount(payload *RequestT) any {
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	count, err := s.repository.Group().CountPendingJoinRequests(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Database error"}
	}

	return &response.GetJoinRequestCount{
		Count: count,
	}
}

func (s *Server) GetUnreadMessagesCountResponse(payload *RequestT) any {
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	pmCount, err := s.repository.Message().CountUnreadPM(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Failed to fetch PM unread count"}
	}

	groupCount, err := s.repository.Message().CountUnreadGroup(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Failed to fetch group unread count"}
	}

	return &response.GetUnreadMessagesCount{
		Count: pmCount + groupCount,
	}
}

func (s *Server) RespondToJoinRequest(payload *RequestT) any {
	data, ok := payload.data.(*request.RespondToJoinRequest)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	adminId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	m := &model.GroupMember{
		UserId:  data.UserId,
		GroupId: data.GroupId,
	}

	ownerId, err := s.repository.Group().GetGroupOwner(m.GroupId)
	if err != nil || ownerId != adminId {
		return &response.Error{Code: 403, Cause: "You are not the group owner"}
	}

	if data.IsAccepted {
		err := s.repository.Group().AcceptMember(m)
		if err != nil {
			return &response.Error{Code: 500, Cause: "Error accepting member: " + err.Error()}
		}
	} else {
		err := s.repository.Group().RemoveMember(m)
		if err != nil {
			return &response.Error{Code: 500, Cause: "Error removing member: " + err.Error()}
		}
	}

	wsMsg := map[string]any{
		"type": "joinRequestHandled",
	}
	for _, c := range s.clients[adminId] {
		s.ShowMessage(c, wsMsg)
	}

	return &response.RespondToJoinRequest{
		Success: true,
		Message: "Join request handled",
	}
}

// GROUP INVITATION METHODS

func (s *Server) GetGroupInviteUsers(payload *RequestT) any {
	data, ok := payload.data.(*request.GetGroupInviteUsers)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}
	users, err := s.repository.Group().GetAvailableUsersToInvite(data.GroupId, userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error getting invite users: " + err.Error()}
	}
	return &response.GetGroupInviteUsers{
		Users: users,
	}
}

func (s *Server) InviteUserToGroup(payload *RequestT) any {
	data, ok := payload.data.(*request.InviteUserToGroup)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	isMember, err := s.repository.Group().IsMember(userId, data.GroupId)
	if err != nil || !isMember {
		return &response.Error{Code: 403, Cause: "You are not a member of this group"}
	}

	err = s.repository.Group().InviteUserToGroup(userId, data.UserId, data.GroupId)
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
	s.sendNotificationToUser(data.UserId, notification)

	return &response.InviteUserToGroup{
		Success: true,
		Message: "User invited successfully",
	}
}

func (s *Server) RespondToGroupInvitation(payload *RequestT) any {
	data, ok := payload.data.(*request.RespondToGroupInvitation)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	var err error
	var msg string
	if data.Accept {
		err = s.repository.Group().AcceptGroupInvitation(userId, data.GroupId)
		msg = "Invitation accepted"
	} else {
		err = s.repository.Group().RejectGroupInvitation(userId, data.GroupId)
		msg = "Invitation rejected"
	}
	if err != nil {
		return &response.Error{Code: 500, Cause: "Error responding to invitation: " + err.Error()}
	}

	return &response.RespondToGroupInvitation{
		Success: true,
		Message: msg,
	}
}

func (s *Server) sendNotificationToUser(userId int, notification map[string]any) {
	s.mu.Lock()
	defer s.mu.Unlock()

	clients, exists := s.clients[userId]
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
