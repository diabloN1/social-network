package controller

func (s *Server) GetChat(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	privateConvs, err := s.repository.Message().GetPrivateConversations(res.Userid)
	if err != nil {
		response["error"] = err.Error()
		return response
	}

	groupConvs, err := s.repository.Message().GetGroupConversations(res.Userid)
	if err != nil {
		response["error"] = err.Error()
		return response
	}

	newConvs, err := s.repository.Message().GetNewConversations(res.Userid)
	if err != nil {
		response["error"] = err.Error()
		return response
	}

	response["privateConvs"] = privateConvs
	response["groupConvs"] = groupConvs
	response["newConvs"] = newConvs

	return response
}
