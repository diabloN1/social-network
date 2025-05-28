package controller

import (
	"log"
)

func (s *Server) GetAllNotifications(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)
	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	var messageUnread int = 0
	var groupRequests int = 0
	var followRequests int = 0

	pmCount, err := s.repository.Message().CountUnreadPM(res.Userid)
	if err != nil {
		log.Println("Error getting unread PM count:", err)
		pmCount = 0
	}

	groupMessageCount, err := s.repository.Message().CountUnreadGroup(res.Userid)
	if err != nil {
		log.Println("Error getting unread group messages:", err)
		groupMessageCount = 0
	}

	messageUnread = pmCount + groupMessageCount

	groupRequests, err = s.repository.Group().CountPendingJoinRequests(res.Userid)
	if err != nil {
		log.Println("Error getting group join requests:", err)
		groupRequests = 0
	}

	followRequests, err = s.repository.Follow().GetFollowRequestCount(res.Userid)
	if err != nil {
		log.Println("Error getting follow requests:", err)
		followRequests = 0
	}
	publicFollowRequests, err := s.repository.Follow().CountPublicFollowRequests(res.Userid)
	if err != nil {
		log.Println("Error getting public follow requests:", err)
		publicFollowRequests = 0
	}
	followRequests += publicFollowRequests

	response["notifications"] = map[string]int{
		"messageUnread":  messageUnread,
		"groupRequests":  groupRequests,
		"followRequests": followRequests,
	}

	response["totalCount"] = messageUnread + groupRequests + followRequests
	return response
}

func (s *Server) CheckNewFollowNotification(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)
	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	exists, err := s.repository.Follow().GetCountPublicFollowRequests(res.Userid)
	if err != nil {
		response["error"] = "Database error"
		return response
	}
	response["hasNewFollow"] = exists
	return response
}
