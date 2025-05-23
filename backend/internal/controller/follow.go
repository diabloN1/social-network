package controller

import (
	"log"
	"real-time-forum/internal/model"
	"time"
)

func (s *Server) RequestFollow(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "followReq",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var profileId float64
	profileIdRaw, ok := request["profileId"]
	if !ok {
		response.Error = "Missing 'profileId' field"
		return response
	}
	profileId, ok = profileIdRaw.(float64)
	if !ok {
		response.Error = "'profileId' must be a float64"
		return response
	}

	err := s.repository.Follow().RequestFollow(int(profileId), res.Userid)
	if err != nil {
		response.Error = err.Error()
		log.Println("Error requesting follow:", err)
	}
	notification := map[string]any{
		"type":       "newfollowrequest",
		"followerId": res.Userid,
		"message":    "New follow request",
		"timestamp":  time.Now().Unix(),
	}
	s.sendNotificationToUser(int(profileId), notification)

	return response
}

func (s *Server) AcceptFollow(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "followReq",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var profileId float64
	profileIdRaw, ok := request["profileId"]
	if !ok {
		response.Error = "Missing 'profileId' field"
		return response
	}
	profileId, ok = profileIdRaw.(float64)
	if !ok {
		response.Error = "'profileId' must be a float64"
		return response
	}

	err := s.repository.Follow().AcceptFollow(int(profileId), res.Userid)
	if err != nil {
		response.Error = err.Error()
		log.Println("Error accepting follow:", err)
	}

	return response
}

func (s *Server) DeleteFollow(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "followReq",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var profileId float64
	profileIdRaw, ok := request["profileId"]
	if !ok {
		response.Error = "Missing 'profileId' field"
		return response
	}
	profileId, ok = profileIdRaw.(float64)
	if !ok {
		response.Error = "'profileId' must be a float64"
		return response
	}

	var isFollower bool
	isFollowerRaw, ok := request["isFollower"]
	if !ok {
		response.Error = "Missing 'isFollower' field"
		return response
	}
	isFollower, ok = isFollowerRaw.(bool)
	if !ok {
		response.Error = "'isFollower' must be a bool"
		return response
	}

	var err error

	// isFollower or been followed.
	if isFollower {
		err = s.repository.Follow().DeleteFollow(int(profileId), res.Userid)

	} else {
		err = s.repository.Follow().DeleteFollow(res.Userid, int(profileId))
		if err != nil {
			response.Error = err.Error()
			log.Println("Error deletting follow:", err)
		}
	}
	if err != nil {
		response.Error = err.Error()
		log.Println("Error deletting follow:", err)
	}

	return response
}
func (s *Server) GetFollowRequestCount(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""
	response["count"] = 0

	res := s.ValidateSession(request)
	if res.Error != "" {
		response["error"] = "Invalid session"
		return response
	}

	count, err := s.repository.Follow().GetFollowRequestCount(res.Userid)
	if err != nil {
		response["error"] = err.Error()
		return response
	}

	response["count"] = count
	return response
}
