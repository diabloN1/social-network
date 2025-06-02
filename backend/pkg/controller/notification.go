package controller

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"time"
)

func (s *Server) GetAllNotifications(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)

	pmCount, err := s.repository.Message().CountUnreadPM(userId)
	if err != nil {
		log.Println("Error getting unread PM count:", err)
		pmCount = 0
	}

	groupMessageCount, err := s.repository.Message().CountUnreadGroup(userId)
	if err != nil {
		log.Println("Error getting unread group messages:", err)
		groupMessageCount = 0
	}

	messageUnread := pmCount + groupMessageCount

	groupRequests, err := s.repository.Group().CountPendingJoinRequests(userId)
	if err != nil {
		log.Println("Error getting group join requests:", err)
		groupRequests = 0
	}

	followRequests, err := s.repository.Follow().GetFollowRequestCount(userId)
	if err != nil {
		log.Println("Error getting follow requests:", err)
		followRequests = 0
	}
	publicFollowRequests, err := s.repository.Follow().CountPublicFollowRequests(userId)
	if err != nil {
		log.Println("Error getting public follow requests:", err)
		publicFollowRequests = 0
	}
	followRequests += publicFollowRequests

	eventCreatedCount, err := s.repository.Group().CountNewEvents(userId)
	if err != nil {
		log.Println("Error getting event created count:", err)
		eventCreatedCount = 0
	}
	groupRequests += eventCreatedCount

	invitations, err := s.repository.Group().GetGroupJoinInvitations(userId)
	if err != nil {
		log.Println("Error getting event created count:", err)
		invitations = 0
	}
	groupRequests += invitations

	notifications := map[string]int{
		"messageUnread":  messageUnread,
		"groupRequests":  groupRequests,
		"followRequests": followRequests,
	}
	totalCount := messageUnread + groupRequests + followRequests

	return &response.GetAllNotifications{
		Notifications: notifications,
		TotalCount:    totalCount,
	}
}

func (s *Server) CheckNewFollowNotification(payload *request.RequestT) any {
	userId := payload.Ctx.Value("user_id").(int)

	users, err := s.repository.Follow().GetNewFollowers(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: "Database error"}
	}

	return &response.CheckNewFollowNotification{
		HasNewFollow: len(users) > 0,
		NewFollowers: users,
	}
}

func (s *Server) DeleteFollowNotification(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.DeleteFollowNotification)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	err := s.repository.Follow().DeleteNotif(data.ProfileId, userId)
	if err != nil {
		log.Println("Error deleting follow notification:", err)
		return &response.Error{Code: 500, Cause: "Error deleting follow notification"}
	}
	notification := map[string]any{
		"type":       "notifications",
		"followerId": data.ProfileId,
		"message":    "unfollow ",
		"timestamp":  time.Now().Unix(),
	}
	s.sendNotificationToUser(userId, notification)
	return &response.DeleteFollowNotification{
		Message: "Notification deleted",
	}
}

func (s *Server) DeleteNewEventNotification(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.DeleteNewEventNotification)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId := payload.Ctx.Value("user_id").(int)

	err := s.repository.Follow().DeleteEventNotif(data.GroupId, userId)
	if err != nil {
		log.Println("Error deleting follow notification:", err)
		return &response.Error{Code: 500, Cause: "Error deleting follow notification"}
	}
	notification := map[string]any{
		"type": "notifications",
	}
	s.sendNotificationToUser(userId, notification)
	return &response.DeleteNewEventNotification{
		Message: "Notification deleted",
	}
}
