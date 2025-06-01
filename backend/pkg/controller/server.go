package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"real-time-forum/pkg/db/sqlite"
	"real-time-forum/pkg/model"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"real-time-forum/pkg/repository"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Server struct {
	router     *http.ServeMux
	repository repository.Repository
	upgrader   *websocket.Upgrader
	clients    map[int][]*Client
	mu         sync.RWMutex
}

func (s *Server) AddRoute(pattern string, handler func(*RequestT) any, middlewares ...http.HandlerFunc) {
	h := HandlerFunc(handler)
	s.router.HandleFunc(pattern, func(resp http.ResponseWriter, req *http.Request) {
		body, err := io.ReadAll(req.Body)
		if err != nil {
			h.ServeError(resp, &response.Error{Cause: "oops, something went wrong", Code: 500})
			return
		}

		reqData, err := request.Unmarshal(body)
		if err != nil {
			h.ServeError(resp, &response.Error{Cause: err.Error(), Code: 500})
			return
		}

		request := &RequestT{
			data:    reqData,
			context: make(map[string]any),
		}
		s.cookieMiddleware(h, request).ServeHTTP(resp, req)
	})
}

type RequestT struct {
	data    any
	context map[string]any
}

type HandlerFunc func(*RequestT) any

func (h HandlerFunc) ServeHTTP(w http.ResponseWriter, request *RequestT) {
	res := h(request)
	status, body := response.Marshal(res)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}

func (h HandlerFunc) ServeError(w http.ResponseWriter, err *response.Error) {
	fmt.Println("Serving error:", err.Cause)
	status, body := response.Marshal(err)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}

type Client struct {
	Session    string
	ActiveTime time.Time
	UserId     int
	Connection *websocket.Conn
}

func Start() error {
	db, err := sqlite.InitDB("pkg/db/forum.db")
	if err != nil {
		return err
	}
	defer db.Close()

	s := NewServer(http.NewServeMux(), db)

	// Login
	s.AddRoute("/login", s.Login)
	s.AddRoute("/register", s.Register)

	s.router.HandleFunc("/session", s.SessionHandler)
	s.router.HandleFunc("/logout", s.LogoutHandler)

	// Posts
	s.AddRoute("/getPosts", s.GetPosts)
	s.AddRoute("/getPost", s.GetPostData)
	s.AddRoute("/addPost", s.AddPost)
	s.AddRoute("/reactToPost", s.ReactToPost)

	// Post Shares
	s.AddRoute("/getPostShares", s.GetPostShares)
	s.AddRoute("/addPostShare", s.AddPostShare)
	s.AddRoute("/removePostShare", s.RemovePostShare)

	// Comments
	s.AddRoute("/addComment", s.AddComment)
	s.AddRoute("/getComments", s.GetComments)

	// Profiles
	s.AddRoute("/getProfiles", s.GetProfiles)
	s.AddRoute("/getProfile", s.GetProfile)
	s.AddRoute("/setPrivacy", s.SetProfilePrivacy)

	// Follows
	s.router.HandleFunc("/requestFollow", s.requestFollowHandler)
	s.router.HandleFunc("/acceptFollow", s.acceptFollowHandler)
	s.router.HandleFunc("/deleteFollow", s.deleteFollowHandler)

	// Groups
	s.AddRoute("/createGroup", s.CreateGroup)
	s.AddRoute("/getGroups", s.GetGroups)
	s.AddRoute("/getGroup", s.GetGroupData)
	
	// Group post reactions and comments
	s.router.HandleFunc("/reactToGroupPost", s.reactToGroupPostHandler)
	s.router.HandleFunc("/addGroupComment", s.addGroupCommentHandler)
	s.router.HandleFunc("/getGroupComments", s.getGroupCommentsHandler)
	s.router.HandleFunc("/getGroupPost", s.getGroupPostHandler)

	s.AddRoute("/addGroupPost", s.AddGroupPost)
	s.AddRoute("/addGroupEvent", s.AddGroupEvent)
	s.AddRoute("/addEventOption", s.AddEventOption)
	s.AddRoute("/requestJoinGroup", s.RequestJoinGroup)
	s.AddRoute("/respondToJoinRequest", s.RespondToJoinRequest)

	// // Group Invitation Routes
	// s.router.HandleFunc("/getGroupInviteUsers", s.getGroupInviteUsersHandler)
	// s.router.HandleFunc("/inviteUserToGroup", s.inviteUserToGroupHandler)
	// s.router.HandleFunc("/respondToGroupInvitation", s.respondToGroupInvitationHandler)

	// Chat
	s.router.HandleFunc("/getChatData", s.GetChatHandler)
	s.router.HandleFunc("/getMessages", s.GetMessagesHandler)
	//notif
	s.router.HandleFunc("/getAllNotifications", s.GetAllNotificationsHandler)
	s.router.HandleFunc("/getNewFollowNotification", s.GetNewFollowNotificationHandler)
	s.router.HandleFunc("/deleteFollowNotif", s.DeleteFollowNotif)
	s.router.HandleFunc("/deleteNotifNewEvent", s.deleteNotifNewEvent)

	// ws
	s.router.HandleFunc("/ws", s.WebSocketHandler)

	// Image
	s.router.HandleFunc("/uploadImage", s.UploadImageHandler)
	s.router.Handle("/getProtectedImage", s.imageMiddleware(http.HandlerFunc(s.ProtectedImageHandler)))

	// go s.checkClientsLastActivity()

	log.Println("Server started at http://localhost:8080/")
	return http.ListenAndServe(":8080", s.corsMiddleware(s))
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func NewServer(router *http.ServeMux, db *sql.DB) *Server {
	upgrader := &websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	r := repository.New(db)

	return &Server{
		router:     router,
		repository: *r,
		upgrader:   upgrader,
		clients:    make(map[int][]*Client),
	}
}

func (s *Server) addClient(userid int, session string, client *websocket.Conn) *Client {
	s.mu.Lock()
	defer s.mu.Unlock()
	c := &Client{UserId: userid, Session: session, ActiveTime: time.Now(), Connection: client}
	s.clients[userid] = append(s.clients[userid], c)
	return c
}

func (s *Server) removeClient(client *Client) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, c := range s.clients[client.UserId] {
		if c == client {

			if i == len(s.clients[client.UserId])-1 {
				s.clients[client.UserId] = s.clients[client.UserId][:i]
			} else {
				s.clients[client.UserId] = append(s.clients[client.UserId][:i], s.clients[client.UserId][i+1:]...)
			}
			s.BroadcastOnlineUsers()
			return
		}
	}
}

func (s *Server) BroadcastOnlineUsers() {
	// response := model.Response{}
	// response.Type = "online"
	// wg := sync.WaitGroup{}
	// wg.Add(len(s.clients))

	// for _, c := range s.clients {
	// 	go func(c *Client) {
	// 		if c.Online == true {
	// 			response.AllUsers = s.FindAllUsers(c.Userid)
	// 			c.Connection.WriteJSON(response)
	// 		}
	// 		wg.Done()
	// 	}(c)
	// }
	// wg.Wait()
}

func (s *Server) readMessage(conn *websocket.Conn, client *Client) {
	for {

		_, payload, err := conn.ReadMessage()
		if err != nil {
			s.BroadcastOnlineUsers()
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message: %v", err)
			}
			s.removeClient(client)
			break
		}

		var request map[string]any

		err = json.Unmarshal(payload, &request)

		if err != nil {
			log.Println("Unmarshal payload err", err)
			return
		}

		requestType, ok := request["type"].(string)
		if !ok {
			log.Println("Invalid or missing 'type' field in the request.")
			return
		}

		switch requestType {
		case "updateseenmessages":
			s.UpdateSeenMessageWS(request)
		case "sendmessage":
			response := s.AddMessage(request)
			if response["error"] != "" {
				fmt.Println(response["error"])
			}
			s.SentToActiveRecipient(response)
			// case "updateseenmessage":
			// 	s.UpdateSeenMessage(request)
			// 	response.Type = "updatetotal"
			// 	userid := int(request["userid"].(float64))
			// 	notifications, err := s.repository.Message().GetTotalNotifications(userid)
			// 	if err != nil {
			// 		log.Println("Error in Get Total:", err)
			// 	}
			// 	response.TotalNotifications = notifications
			// case "typing":
			// 	response = s.UpdateIsTyping(request)
			// 	if response.Error == "" {
			// 		s.SendIsTyping(response)
			// 	}

		}

		// s.mu.Lock()

		// if response.Session != "" {
		// 	// response.Categories = s.GetCategoryAllData()
		// 	response.AllUsers = s.FindAllUsers(response.Userid)
		// }

		// if response.Error != "" || (response.Type != "newmessage" && response.Type != "updatetyping") {
		// 	client.WriteJSON(response)
		// }
		// if response.Type != "updatetyping" {
		// 	s.BroadcastOnlineUsers()
		// }

		// s.mu.Unlock()
	}
}

func (s *Server) SentToActiveRecipient(response map[string]any) {
	if response["error"] != "" {
		return
	}

	senderId := response["message"].(*model.Message).SenderId
	RecipientId := response["message"].(*model.Message).RecipientId
	groupId := response["message"].(*model.Message).GroupId

	for _, c := range s.clients[senderId] {
		response["isOwned"] = true
		s.ShowMessage(c, response)
	}

	if RecipientId != 0 {
		// Brodcast to RecipientId
		for _, c := range s.clients[RecipientId] {
			response["isOwned"] = false
			s.ShowMessage(c, response)
		}
	} else {
		// Brodcast to group members
		users, err := s.repository.Group().GetGroupMembers(groupId)
		if err != nil {
			fmt.Println("Error broadcasting to group members:", err)
			return
		}

		for _, u := range users {
			if u.ID != senderId {
				for _, c := range s.clients[u.ID] {
					response["isOwned"] = false
					s.ShowMessage(c, response)
				}
			}
		}
	}

}

func (s *Server) ShowMessage(client *Client, response map[string]any) {
	if client == nil {
		return
	}

	// notifications, err := s.repository.Message().GetTotalNotifications(client.Userid)
	// if err != nil {
	// 	log.Println("Error: ", err)
	// }
	// response.TotalNotifications = notifications
	client.Connection.WriteJSON(response)
}

func (s *Server) SendIsTyping(response model.Response) {
	clientsTargeted := s.clients[response.Userid]
	for _, c := range clientsTargeted {
		c.Connection.WriteJSON(response)
	}
}
