package controller

import (
	"log"
	"real-time-forum/internal/model"
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

	err := s.repository.Follow().DeleteFollow(int(profileId), res.Userid)
	if err != nil {
		response.Error = err.Error()
		log.Println("Error deletting follow:", err)
	}

	return response
}
