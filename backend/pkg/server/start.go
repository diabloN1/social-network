package server

import (
	"log"
	"net/http"
	"real-time-forum/pkg/db/sqlite"
)

func Start() error {
	db, err := sqlite.InitDB("pkg/db/forum.db")
	if err != nil {
		return err
	}
	defer db.Close()

	s := NewServer(http.NewServeMux(), db)

	// Auth
	s.AddRoute("/login", s.app.Login)
	s.AddRoute("/register", s.app.Register)
	s.AddRoute("/logout", s.app.Logout)

	// Posts
	s.AddRoute("/getPosts", s.app.GetPosts)
	s.AddRoute("/getPost", s.app.GetPostData)
	s.AddRoute("/addPost", s.app.AddPost)
	s.AddRoute("/reactToPost", s.app.ReactToPost)

	// Post Shares
	s.AddRoute("/getPostShares", s.app.GetPostShares)
	s.AddRoute("/addPostShare", s.app.AddPostShare)
	s.AddRoute("/removePostShare", s.app.RemovePostShare)

	// Comments
	s.AddRoute("/addComment", s.app.AddComment)
	s.AddRoute("/getComments", s.app.GetComments)

	// Profiles
	s.AddRoute("/getProfiles", s.app.GetProfiles)
	s.AddRoute("/getProfile", s.app.GetProfile)
	s.AddRoute("/setPrivacy", s.app.SetProfilePrivacy)

	// Follows
	s.AddRoute("/requestFollow", s.app.RequestFollow)
	s.AddRoute("/acceptFollow", s.app.AcceptFollow)
	s.AddRoute("/deleteFollow", s.app.DeleteFollow)

	// Groups
	s.AddRoute("/createGroup", s.app.CreateGroup)
	s.AddRoute("/getGroups", s.app.GetGroups)
	s.AddRoute("/getGroup", s.app.GetGroupData)

	// Group post reactions and comments
	s.AddRoute("/reactToGroupPost", s.app.ReactToGroupPost, s.app.IsMemberMiddleware)
	s.AddRoute("/addGroupComment", s.app.AddGroupComment, s.app.IsMemberMiddleware)
	s.AddRoute("/getGroupComments", s.app.GetGroupComments, s.app.IsMemberMiddleware)

	s.AddRoute("/addGroupPost", s.app.AddGroupPost, s.app.IsMemberMiddleware)
	s.AddRoute("/addGroupEvent", s.app.AddGroupEvent, s.app.IsMemberMiddleware)
	s.AddRoute("/addEventOption", s.app.AddEventOption, s.app.IsMemberMiddleware)
	s.AddRoute("/requestJoinGroup", s.app.RequestJoinGroup)
	s.AddRoute("/respondToJoinRequest", s.app.RespondToJoinRequest)

	// Group Invitation Routes
	s.AddRoute("/getGroupInviteUsers", s.app.GetGroupInviteUsers, s.app.IsMemberMiddleware)
	s.AddRoute("/inviteUserToGroup", s.app.InviteUserToGroup, s.app.IsMemberMiddleware)
	s.AddRoute("/respondToGroupInvitation", s.app.RespondToGroupInvitation)

	// Chat
	s.AddRoute("/getChatData", s.app.GetChat)
	s.AddRoute("/getMessages", s.app.GetMessages)

	//notif
	s.AddRoute("/getAllNotifications", s.app.GetAllNotifications)
	s.AddRoute("/getNewFollowNotification", s.app.CheckNewFollowNotification)
	s.AddRoute("/deleteFollowNotif", s.app.DeleteFollowNotification)
	s.AddRoute("/deleteNotifNewEvent", s.app.DeleteNewEventNotification)

	// ws
	s.router.HandleFunc("/ws", s.app.WebSocketHandler)

	// Image
	s.router.HandleFunc("/uploadImage", s.app.UploadImageHandler)
	s.router.Handle("/getProtectedImage", s.app.ImageMiddleware(http.HandlerFunc(s.app.ProtectedImageHandler)))

	log.Println("Server started at http://localhost:8080/")
	return http.ListenAndServe(":8080", s.app.CorsMiddleware(s))
}
