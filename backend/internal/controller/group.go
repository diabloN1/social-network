package controller

import (
	"database/sql"
	"log"
	"real-time-forum/internal/model"
	"time"
)

func (s *Server) CreateGroup(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)
	if res.Error != "" {
		response["error"] = "Invalid session"
		return response
	}

	// Validate title
	titleRaw, ok := request["title"]
	if !ok {
		response["Type"] = "title"
		response["Error"] = "Missing 'title' field"
		return response
	}
	title, ok := titleRaw.(string)
	if !ok {
		response["Type"] = "title"
		response["Error"] = "'title' must be a string"
		return response
	}

	// Validate description
	descriptionRaw, ok := request["description"]
	if !ok {
		response["Type"] = "description"
		response["Error"] = "Missing 'description' field"
		return response
	}
	description, ok := descriptionRaw.(string)
	if !ok {
		response["Type"] = "description"
		response["Error"] = "'description' must be a string"
		return response
	}

	// Validate image
	imageRaw, ok := request["image"]
	if !ok {
		response["Type"] = "image"
		response["Error"] = "Missing 'image' field"
		return response
	}
	image, ok := imageRaw.(string)
	if !ok {
		response["Type"] = "image"
		response["Error"] = "'image' must be a string"
		return response
	}

	g := &model.Group{
		OwnerId:     res.Userid,
		Title:       title,
		Description: description,
		Image:       image,
	}
	err := s.repository.Group().Create(g)
	if err != nil {
		response["error"] = "Can't create group :" + err.Error()
		return response
	}

	return response
}

func (s *Server) GetGroups(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)
	if res.Error != "" {
		response["error"] = "Invalid session"
		return response
	}

	var err error
	response["group_invites"], err = s.repository.Group().GetGroupInvitesByUserId(res.Userid)
	if err != nil {
		response["error"] = "Can't get group invites :" + err.Error()
		return response
	}

	response["join_requests"], err = s.repository.Group().GetJoinRequestsByOwnerId(res.Userid)
	if err != nil {
		response["error"] = "Can't get join requests :" + err.Error()
		return response
	}

	response["all"], err = s.repository.Group().GetGroups(res.Userid)
	if err != nil {
		response["error"] = "Can't get groups :" + err.Error()
		return response
	}

	return response
}

func (s *Server) GetGroupData(request map[string]any) map[string]any {
	var response = make(map[string]any)
	response["type"] = "groupData"

	res := s.ValidateSession(request)
	if res.Error != "" {
		response["error"] = "Invalid session"
		return response
	}

	// Validate groupId
	groupIdRaw, ok := request["groupId"]
	if !ok {
		response["Type"] = "groupId"
		response["Error"] = "Missing 'groupId' field"
		return response
	}
	groupId, ok := groupIdRaw.(float64)
	if !ok {
		response["Type"] = "groupId"
		response["Error"] = "'groupId' must be a string"
		return response
	}

	var err error
	response["group"], err = s.repository.Group().GetGroupData(int(groupId), res.Userid)
	if err != nil {
		response["error"] = err.Error()
	}

	return response
}

func (s *Server) AddGroupPost(request map[string]any) *model.Response {
	p := &model.Post{}
	u := &model.User{}
	p.User = u
	response := &model.Response{}

	groupIdRaw, ok := request["groupId"]
	if !ok {
		response.Error = "Missing 'groupId' field"
		return response
	}
	groupId, ok := groupIdRaw.(float64)
	if !ok {
		response.Error = "'groupId' must be a string"
		return response
	}

	captionRaw, ok := request["caption"]
	if !ok {
		response.Error = "Missing 'caption' field"
		return response
	}
	caption, ok := captionRaw.(string)
	if !ok {
		response.Error = "'caption' must be a string"
		return response
	}

	imageRaw, ok := request["image"]
	if !ok {
		response.Error = "Missing 'image' field"
		return response
	}
	image, ok := imageRaw.(string)
	if !ok {
		response.Error = "'image' must be a string"
		return response
	}

	if caption == "" && image == "" {
		response.Error = "Can't create empty posts"
		return response
	}

	res := s.ValidateSession(request)

	if res.Session == "" {
		response.Error = "Invalid session"
		return response
	}

	// Assign values after validation
	p.UserId = res.Userid
	p.Caption = caption
	p.Image = image
	p.User.Firstname = res.User.Firstname
	p.User.Lastname = res.User.Lastname
	p.User.Avatar = res.User.Avatar

	response.Type = "newPost"

	if len(p.Caption) > 1000 {
		log.Println("Caption exceed limited chars")
		response.Error = "Error text or title exceed limited chars or empty"
		return response
	}

	err := s.repository.Group().AddGroupPost(p, int(groupId))

	if err != nil {
		response.Error = "Error adding post: " + err.Error()
		return response
	}

	response.Posts = []*model.Post{p}
	return response
}

func (s *Server) AddGroupEvent(request map[string]any) map[string]any {
	e := &model.GroupEvent{}
	u := &model.User{}
	e.User = u
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	groupIdRaw, ok := request["groupId"]
	if !ok {
		response["error"] = "Missing 'groupId' field"
		return response
	}
	groupId, ok := groupIdRaw.(float64)
	if !ok {
		response["error"] = "'groupId' must be a string"
		return response
	}

	titleRaw, ok := request["title"]
	if !ok {
		response["error"] = "Missing 'title' field"
		return response
	}
	title, ok := titleRaw.(string)
	if !ok {
		response["error"] = "'title' must be a string"
		return response
	}

	descriptionRaw, ok := request["description"]
	if !ok {
		response["error"] = "Missing 'description' field"
		return response
	}
	description, ok := descriptionRaw.(string)
	if !ok {
		response["error"] = "'description' must be a string"
		return response
	}

	option1Raw, ok := request["option1"]
	if !ok {
		response["error"] = "Missing 'option1' field"
		return response
	}
	option1, ok := option1Raw.(string)
	if !ok {
		response["error"] = "'option1' must be a string"
		return response
	}

	option2Raw, ok := request["option2"]
	if !ok {
		response["error"] = "Missing 'option2' field"
		return response
	}
	option2, ok := option2Raw.(string)
	if !ok {
		response["error"] = "'option2' must be a string"
		return response
	}

	dateRaw, ok := request["date"]
	if !ok {
		response["error"] = "Missing 'date' field"
		return response
	}
	date, ok := dateRaw.(string)
	if !ok {
		response["error"] = "'date' must be a string"
		return response
	}

	placeRaw, ok := request["place"]
	if !ok {
		response["error"] = "Missing 'place' field"
		return response
	}
	place, ok := placeRaw.(string)
	if !ok {
		response["error"] = "'place' must be a string"
		return response
	}

	if title == "" || description == "" || option1 == "" || option2 == "" || date == "" || place == "" {
		response["error"] = "Can't create empty events (must fill all required fields)"
		return response
	}

	// Assign values after validation
	e.UserId = res.Userid
	e.Title = title
	e.Description = description
	e.Option1 = option1
	e.Option2 = option2
	e.Place = place
	e.Date = date
	e.User.ID = res.User.ID
	e.User.Firstname = res.User.Firstname
	e.User.Lastname = res.User.Lastname
	e.User.Avatar = res.User.Avatar

	// Should pretect insertion fields
	err := s.repository.Group().AddGroupEvent(e, int(groupId))

	if err != nil {
		response["error"] = "Error adding post: " + err.Error()
		return response
	}

	response["event"] = e
	return response
}

func (s *Server) AddEventOption(request map[string]any) map[string]any {
	opt := &model.EventOption{}
	u := &model.User{}
	opt.User = u
	response := make(map[string]any)
	response["error"] = ""

	groupIdRaw, ok := request["groupId"]
	if !ok {
		response["error"] = "Missing 'groupId' field"
		return response
	}
	groupId, ok := groupIdRaw.(float64)
	if !ok {
		response["error"] = "'groupId' must be a string"
		return response
	}

	eventIdRaw, ok := request["eventId"]
	if !ok {
		response["error"] = "Missing 'eventId' field"
		return response
	}
	eventId, ok := eventIdRaw.(float64)
	if !ok {
		response["error"] = "'eventId' must be a string"
		return response
	}

	optionRaw, ok := request["option"]
	if !ok {
		response["error"] = "Missing 'option' field"
		return response
	}
	option, ok := optionRaw.(bool)
	if !ok {
		response["error"] = "'option' must be a boolean"
		return response
	}

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	// Assign values after validation
	opt.EventId = int(eventId)
	opt.IsGoing = option
	opt.User.ID = res.User.ID
	opt.User.Firstname = res.User.Firstname
	opt.User.Lastname = res.User.Lastname
	opt.User.Avatar = res.User.Avatar
	opt.User.Nickname = res.User.Nickname

	// Should pretect insertion fields
	err := s.repository.Group().AddEventOption(opt, int(groupId))

	if err != nil {
		response["error"] = "Error adding option: " + err.Error()
		return response
	}

	response["option"] = opt
	return response
}

func (s *Server) RequestJoinGroup(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	groupIdRaw, ok := request["groupId"]
	if !ok {
		response["error"] = "Missing 'groupId' field"
		return response
	}
	groupId, ok := groupIdRaw.(float64)
	if !ok {
		response["error"] = "'groupId' must be a string"
		return response
	}

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	// Assign values after validation
	m := &model.GroupMember{
		UserId:     res.Userid,
		GroupId:    int(groupId),
		IsAccepted: false,
	}

	// Should pretect insertion fields
	err := s.repository.Group().GetMember(m)
	if err != sql.ErrNoRows {
		response["error"] = "Error checking if member already exists"
		return response
	}

	if m.ID != 0 {
		response["error"] = "Request or membership already exists"
		return response
	}

	err = s.repository.Group().AddMember(m)

	if err != nil {
		response["error"] = "Error adding member: " + err.Error()
		return response
	}
	ownerId, err := s.repository.Group().GetGroupOwner(m.GroupId)
	if err == nil {
		notification := map[string]any{
			"type":      "newjoinrequest",
			"groupId":   m.GroupId,
			"userId":    m.UserId,
			"message":   "New join request to your group",
			"timestamp": time.Now().Unix(),
		}
		s.sendNotificationToUser(ownerId, notification)
	}
	return response
}

func (s *Server) GetJoinRequestCount(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)
	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	count, err := s.repository.Group().CountPendingJoinRequests(res.Userid)
	if err != nil {
		response["error"] = "Database error"
		return response
	}

	response["count"] = count
	return response
}
func (s *Server) GetUnreadMessagesCountResponse(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	res := s.ValidateSession(request)
	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	userId := res.Userid

	pmCount, err := s.repository.Message().CountUnreadPM(userId)
	if err != nil {
		response["error"] = "Failed to fetch PM unread count"
		return response
	}

	groupCount, err := s.repository.Message().CountUnreadGroup(userId)
	if err != nil {
		response["error"] = "Failed to fetch group unread count"
		return response
	}

	response["count"] = pmCount + groupCount
	return response
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

func (s *Server) RespondToJoinRequest(request map[string]any) map[string]any {
	response := make(map[string]any)
	response["error"] = ""

	groupIdRaw, ok := request["groupId"]
	if !ok {
		response["error"] = "Missing 'groupId' field"
		return response
	}
	groupId, ok := groupIdRaw.(float64)
	if !ok {
		response["error"] = "'groupId' must be a string"
		return response
	}

	userIdRaw, ok := request["userId"]
	if !ok {
		response["error"] = "Missing 'userId' field"
		return response
	}
	userId, ok := userIdRaw.(float64)
	if !ok {
		response["error"] = "'userId' must be a string"
		return response
	}

	isAcceptedRaw, ok := request["isAccepted"]
	if !ok {
		response["error"] = "Missing 'isAccepted' field"
		return response
	}
	isAccepted, ok := isAcceptedRaw.(bool)
	if !ok {
		response["error"] = "'isAccepted' must be a string"
		return response
	}

	res := s.ValidateSession(request)

	if res.Session == "" {
		response["error"] = "Invalid session"
		return response
	}

	// Assign values after validation
	m := &model.GroupMember{
		UserId:  int(userId),
		GroupId: int(groupId),
	}

	// Check if Owner
	ownerId, err := s.repository.Group().GetGroupOwner(m.GroupId)
	if err != nil || ownerId != res.Userid {
		response["error"] = "Error checking if user is an admin" + err.Error()
		return response
	}

	if isAccepted {
		err := s.repository.Group().AcceptMember(m)

		if err != nil {
			response["error"] = "Error accepting member: " + err.Error()
			return response
		}
	} else {
		err := s.repository.Group().RemoveMember(m)

		if err != nil {
			response["error"] = "Error removing member: " + err.Error()
			return response
		}
	}
wsMsg := map[string]any{
		"type": "joinRequestHandled",
	}
	for _, c := range s.clients[res.Userid] {
		s.ShowMessage(c, wsMsg)
	}
	return response
}
