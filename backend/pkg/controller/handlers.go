package controller

import (
	"fmt"
	"log"
	"net/http"
)

func (s *Server) WebSocketHandler(w http.ResponseWriter, r *http.Request) {

	if r.Header.Get("Upgrade") == "websocket" {
		conn, err := s.upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err.Error())
			return
		}

		token := r.FormValue("session")
		uid, err := s.repository.Session().FindUserIDBySession(token)
		if err != nil {
			log.Println("Session was not found!")
			return
		}

		client := s.addClient(uid, token, conn)

		go s.readMessage(conn, client)

	}
}

// AUTH Handlers
func (s *Server) LoginHanlder(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.Login(request)
	s.SendJson(w, response, err)
}

func (s *Server) RegisterHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.Register(request)
	s.SendJson(w, response, err)
}

func (s *Server) SessionHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.ValidateSession(request)
	s.SendJson(w, response, err)
}

func (s *Server) LogoutHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.Logout(request)
	s.SendJson(w, response, err)
}

// POST Handlers
func (s *Server) AddPostHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AddPost(request)
	s.SendJson(w, response, err)
}

func (s *Server) getPostsHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetPosts(request)
	s.SendJson(w, response, err)
}

func (s *Server) getPostHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetPostData(request)
	s.SendJson(w, response, err)
}

// POST SHARE Handlers
func (s *Server) getPostSharesHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.GetPostShares(request)
	s.SendJson(w, response, err)
}

func (s *Server) addPostShareHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.AddPostShare(request)
	s.SendJson(w, response, err)
}

func (s *Server) removePostShareHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.RemovePostShare(request)
	s.SendJson(w, response, err)
}

// PROFILE Handlers
func (s *Server) GetProfilesHanlder(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetProfiles(request)
	s.SendJson(w, response, err)
}

func (s *Server) getProfileHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetProfile(request)
	s.SendJson(w, response, err)
}

func (s *Server) SetPrivacyHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.setProfilePrivacy(request)
	s.SendJson(w, response, err)
}
//notification
func (s *Server) GetAllNotificationsHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.GetAllNotifications(request)
	s.SendJson(w, response, err)
}

// Follow Handlers
func (s *Server) requestFollowHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.RequestFollow(request)
	s.SendJson(w, response, err)
}

func (s *Server) GetNewFollowNotificationHandler(w http.ResponseWriter, r *http.Request) {
    request, err := s.ReadRequest(r.Body)
    response := s.CheckNewFollowNotification(request)
    s.SendJson(w, response, err)
}

func (s *Server) DeleteFollowNotif(w http.ResponseWriter, r *http.Request) {
    request, err := s.ReadRequest(r.Body)
    response := s.DeleteFollowNotification(request)
    s.SendJson(w, response, err)
}



func (s *Server) getFollowRequestCountHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.GetFollowRequestCount(request)
	s.SendJson(w, response, err)
}
func (s *Server) acceptFollowHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AcceptFollow(request)
	s.SendJson(w, response, err)
}

func (s *Server) deleteFollowHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.DeleteFollow(request)
	s.SendJson(w, response, err)
}

// Groups
func (s *Server) CreateGroupHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.CreateGroup(request)
	s.SendJson(w, response, err)
}

func (s *Server) GetGroupsHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetGroups(request)
	s.SendJson(w, response, err)
}

func (s *Server) GetGroupHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetGroupData(request)
	s.SendJson(w, response, err)
}
func (s *Server) GetCountRequest(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.GetJoinRequestCount(request)
	s.SendJson(w, response, err)
}
func (s *Server) GetUnreadMessagesCount(w http.ResponseWriter, r *http.Request) {
    request, err := s.ReadRequest(r.Body)
    response := s.GetUnreadMessagesCountResponse( request)
    s.SendJson(w, response, err)
}

func (s *Server) AddGroupPostHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AddGroupPost(request)
	s.SendJson(w, response, err)
}

func (s *Server) AddGroupEventHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AddGroupEvent(request)
	s.SendJson(w, response, err)
}

func (s *Server) AddEventOptionHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AddEventOption(request)
	s.SendJson(w, response, err)
}

func (s *Server) reactToPostHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.ReactToPost(request)
	s.SendJson(w, response, err)
}

func (s *Server) addCommentHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AddComment(request)
	s.SendJson(w, response, err)
}

func (s *Server) getCommentsHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetComments(request)
	s.SendJson(w, response, err)
}

// Group requests and invites
func (s *Server) RequestJoinGroupHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.RequestJoinGroup(request)
	s.SendJson(w, response, err)
}

func (s *Server) RespondToJoinRequestHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.RespondToJoinRequest(request)
	s.SendJson(w, response, err)
}

func (s *Server) GetChatHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetChat(request)
	s.SendJson(w, response, err)
}

func (s *Server) GetMessagesHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetMessages(request)
	s.SendJson(w, response, err)
}

// Images
func (s *Server) UploadImageHandler(w http.ResponseWriter, r *http.Request) {
	s.SendJson(w, s.UploadImage(r), nil)
}

func (s *Server) ProtectedImageHandler(w http.ResponseWriter, r *http.Request) {
	fullPath, ok := r.Context().Value("fullPath").(string)
	fmt.Println(fullPath)
	if !ok || fullPath == "" {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	http.ServeFile(w, r, fullPath)
}

// Group Invitation Handlers
func (s *Server) getGroupInviteUsersHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.GetGroupInviteUsers(request)
	s.SendJson(w, response, err)
}

func (s *Server) inviteUserToGroupHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.InviteUserToGroup(request)
	s.SendJson(w, response, err)
}

func (s *Server) respondToGroupInvitationHandler(w http.ResponseWriter, r *http.Request) {
	request, err := s.ReadRequest(r.Body)
	response := s.RespondToGroupInvitation(request)
	s.SendJson(w, response, err)
}
