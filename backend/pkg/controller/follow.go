package controller

import (
	"log"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"time"
)

func (s *Server) RequestFollow(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.RequestFollow)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.Context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	err := s.repository.Follow().RequestFollow(data.ProfileId, userId)
	if err != nil {
		log.Println("Error requesting follow:", err)
		return &response.Error{Code: 500, Cause: err.Error()}
	}
	notification := map[string]any{
		"type":       "notifications",
		"followerId": userId,
		"message":    "New follow request",
		"timestamp":  time.Now().Unix(),
	}
	s.sendNotificationToUser(data.ProfileId, notification)

	return &response.RequestFollow{
		Success: true,
		Message: "Follow request sent",
	}
}

func (s *Server) AcceptFollow(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.AcceptFollow)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.Context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	err := s.repository.Follow().AcceptFollow(data.ProfileId, userId)
	if err != nil {
		log.Println("Error accepting follow:", err)
		return &response.Error{Code: 500, Cause: err.Error()}
	}
	wsMsg := map[string]any{
		"type": "followRequestHandled",
	}
	for _, c := range s.clients[userId] {
		s.ShowMessage(c, wsMsg)
	}
	return &response.AcceptFollow{
		Success: true,
		Message: "Follow request accepted",
	}
}

func (s *Server) DeleteFollow(payload *request.RequestT) any {
	data, ok := payload.Data.(*request.DeleteFollow)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}
	userId, ok := payload.Context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	var err error
	if data.IsFollower {
		err = s.repository.Follow().DeleteFollow(data.ProfileId, userId)
		if err == nil {
			err = s.repository.Follow().DeleteNotif(userId, data.ProfileId)
		}
		notification := map[string]any{
			"type":       "notifications",
			"followerId": userId,
			"message":    "unfollow",
			"timestamp":  time.Now().Unix(),
		}
		s.sendNotificationToUser(data.ProfileId, notification)
	} else {
		err = s.repository.Follow().DeleteFollow(userId, data.ProfileId)
		notification := map[string]any{
			"type":       "notifications",
			"followerId": data.ProfileId,
			"message":    "unfollow",
			"timestamp":  time.Now().Unix(),
		}
		s.sendNotificationToUser(userId, notification)
	}
	if err != nil {
		log.Println("Error deleting follow:", err)
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	return &response.DeleteFollow{
		Success: true,
		Message: "Unfollowed successfully",
	}
}
