package controller

import (
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

func (s *Server) GetProfile(payload *RequestT) any {
	data, ok := payload.data.(*request.GetProfile)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	user, err := s.repository.User().FindProfile(data.ProfileId, userId)
	if err != nil {
		return &response.Error{Code: 404, Cause: err.Error()}
	}

	return &response.GetProfile{
		User: user,
	}
}

func (s *Server) GetProfiles(payload *RequestT) any {
	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	followRequests, err := s.repository.Follow().GetFollowRequests(userId)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	allUsers, err := s.repository.User().GetAllUsers()
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	var otherUsers []*model.User
	var currentUser *model.User
	for _, user := range allUsers {
		if user.ID != userId {
			otherUsers = append(otherUsers, user)
		} else {
			currentUser = user
		}
	}

	return &response.GetProfiles{
		FollowRequests: followRequests,
		AllUsers:       otherUsers,
		CurrentUser:    currentUser,
	}
}

func (s *Server) SetProfilePrivacy(payload *RequestT) any {
	data, ok := payload.data.(*request.SetProfilePrivacy)
	if !ok {
		return &response.Error{Code: 400, Cause: "Invalid payload type"}
	}

	userId, ok := payload.context["user_id"].(int)
	if !ok {
		return &response.Error{Code: 401, Cause: "Invalid session"}
	}

	err := s.repository.User().SetUserPrivacy(userId, data.State)
	if err != nil {
		return &response.Error{Code: 500, Cause: err.Error()}
	}

	return &response.SetProfilePrivacy{
		Success: true,
	}
}
