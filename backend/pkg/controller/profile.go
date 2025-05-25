package controller

import (
	"real-time-forum/pkg/model"
)

func (s *Server) GetProfile(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "profile",
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

	var err error
	response.User, err = s.repository.User().FindProfile(int(profileId), res.Userid)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	return response
}

func (s *Server) GetProfiles(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "profiles feed",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var err error
	response.FollowRequests, err = s.repository.Follow().GetFollowRequests(res.Userid)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	response.AllUsers, err = s.repository.User().GetAllUsers()
	if err != nil {
		response.Error = err.Error()
		return response
	}

	return response
}

func (s *Server) setProfilePrivacy(request map[string]any) *model.Response {
	response := &model.Response{
		Type:  "privacy",
		Error: "",
	}

	res := s.ValidateSession(request)
	if res.Error != "" {
		response.Error = "Invalid session"
		return response
	}

	var state bool
	stateRaw, ok := request["state"]
	if !ok {
		response.Error = "Missing 'state' field"
		return response
	}
	state, ok = stateRaw.(bool)
	if !ok {
		response.Error = "'state' must be a bool"
		return response
	}

	err := s.repository.User().SetUserPrivacy(res.Userid, state)
	if err != nil {
		response.Error = err.Error()
		return response
	}

	return response
}
