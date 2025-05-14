package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/internal/model"
	"real-time-forum/internal/repository"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Server struct {
	router     *http.ServeMux
	repository repository.Repository
	upgrader   *websocket.Upgrader
	clients    []*Client
	mu         sync.RWMutex
}

type Client struct {
	Session    string
	ActiveTime time.Time
	Connection *websocket.Conn
	Userid     int
	Username   string
	Online     bool
}

func Start() error {
	db, err := initDB("db/forum.db")
	if err != nil {
		return err
	}
	defer db.Close()

	s := NewServer(http.NewServeMux(), db)

	// s.router.Handle("/view/", http.StripPrefix("/view/", http.FileServer(http.Dir("./view"))))
	// s.router.HandleFunc("/", s.Home)

	// Login
	s.router.HandleFunc("/login", s.LoginHanlder)
	s.router.HandleFunc("/register", s.RegisterHandler)
	s.router.HandleFunc("/session", s.SessionHandler)
	s.router.HandleFunc("/logout", s.LogoutHandler)
	s.router.HandleFunc("/addPost", s.AddPostHandler)

	// Posts
	s.router.HandleFunc("/getPosts", s.getPostsHandler)
	s.router.HandleFunc("/getPost", s.getPostHandler)
	s.router.HandleFunc("/reactToPost", s.reactToPostHandler)
	// Comments
	s.router.HandleFunc("/addComment", s.addCommentHandler)
	s.router.HandleFunc("/getComments", s.getCommentsHandler)

	// Profiles
	s.router.HandleFunc("/getProfiles", s.GetProfilesHanlder)
	s.router.HandleFunc("/getProfile", s.getProfileHandler)
	s.router.HandleFunc("/setPrivacy", s.SetPrivacyHandler)

	// Follows
	s.router.HandleFunc("/requestFollow", s.requestFollowHandler)
	s.router.HandleFunc("/acceptFollow", s.acceptFollowHandler)
	s.router.HandleFunc("/deleteFollow", s.deleteFollowHandler)

	// Groups
	s.router.HandleFunc("/createGroup", s.CreateGroupHandler)
	s.router.HandleFunc("/getGroups", s.GetGroupsHandler)
	s.router.HandleFunc("/getGroup", s.GetGroupHandler)
	s.router.HandleFunc("/addGroupPost", s.AddGroupPostHandler)
	s.router.HandleFunc("/addGroupEvent", s.AddGroupEventHandler)
	s.router.HandleFunc("/addEventOption", s.AddEventOptionHandler)
	s.router.HandleFunc("/requestJoinGroup", s.RequestJoinGroupHandler)
	s.router.HandleFunc("/respondToJoinRequest", s.RespondToJoinRequestHandler)

	// Chat
	s.router.HandleFunc("/getChatData", s.GetChatHandler)

	// ws
	s.router.HandleFunc("/ws", s.WebSocketHandler)


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
			// origin := r.Header.Get("Origin")
			// return origin == "http://localhost:3000"
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
		clients:    []*Client{},
	}
}

func (s *Server) addClient(userid int, session string, client *websocket.Conn, username string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	c := &Client{Userid: userid, Session: session, ActiveTime: time.Now(), Connection: client, Username: username, Online: true}
	s.clients = append(s.clients, c)
}

func (s *Server) removeClient(sessionAny any, client *websocket.Conn) {
	s.mu.Lock()
	defer s.mu.Unlock()
	response := model.Response{}

	response.Type = "logout"
	response.Session = ""
	response.Error = "Session was removed!"

	var session string
	var ok bool
	if session, ok = sessionAny.(string); !ok {
		fmt.Println("'session' must be a string!")
		return
	}

	for i, c := range s.clients {
		if c.Session == session {
			err := client.WriteJSON(response)
			if err != nil {
				return
			}

			if i == len(s.clients)-1 {
				s.clients = s.clients[:i]
			} else {
				s.clients = append(s.clients[:i], s.clients[i+1:]...)
			}
			s.BroadcastOnlineUsers()
			return
		}
	}
}

func (s *Server) checkClientsLastActivity() {
	for {
		currentTime := time.Now()
		for _, client := range s.clients {
			if currentTime.Sub(client.ActiveTime).Minutes() > 30 {
				client.Online = false
				s.BroadcastOnlineUsers()
			}
		}
		time.Sleep(time.Second)
	}
}

func (s *Server) updateClientTime(client *websocket.Conn) {
	for _, c := range s.clients {
		if c.Connection == client {
			c.ActiveTime = time.Now()
			c.Online = true
		}
	}
}

func (s *Server) BroadcastOnlineUsers() {
	response := model.Response{}
	response.Type = "online"
	wg := sync.WaitGroup{}
	wg.Add(len(s.clients))

	for _, c := range s.clients {
		go func(c *Client) {
			if c.Online == true {
				response.AllUsers = s.FindAllUsers(c.Userid)
				c.Connection.WriteJSON(response)
			}
			wg.Done()
		}(c)
	}
	wg.Wait()
}

func (s *Server) BroadcastAddedContent(response model.Response) {
	if response.Error != "" {
		return
	}

	wg := sync.WaitGroup{}
	wg.Add(len(s.clients))
	for _, c := range s.clients {
		go func(c *Client) {
			if c.Online == true {
				response.AllUsers = s.FindAllUsers(c.Userid)
				c.Connection.WriteJSON(response)
			}
			wg.Done()
		}(c)
	}
	wg.Wait()
}

func (s *Server) readMessage(client *websocket.Conn) {
	for {

		_, payload, err := client.ReadMessage()
		if err != nil {
			s.BroadcastOnlineUsers()
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message: %v", err)
			}
			break
		}

		var request map[string]any
		response := model.Response{}

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

		// case "register":
		// 	response = s.Register(request)
		// 	if response.Error == "" {
		// 		s.addClient(response.Userid, response.Session, client, response.Username)
		// 	}
		// 	notifications, err := s.repository.Message().GetTotalNotifications(response.Userid)
		// 	if err != nil {
		// 		log.Println("Notifications error:", err)
		// 	}
		// 	response.TotalNotifications = notifications
		// case "login":
		// 	response = s.Login(request)
		// 	if response.Error == "" {
		// 		s.addClient(response.Userid, response.Session, client, response.Username)
		// 	}
		// 	notifications, err := s.repository.Message().GetTotalNotifications(response.Userid)
		// 	if err != nil {
		// 		log.Println("Notifications error:", err)
		// 	}
		// 	response.TotalNotifications = notifications
		// case "session":
		// 	response = s.ValidateSession(request)
		// 	if response.Session != "" {
		// 		s.addClient(response.Userid, response.Session, client, response.Username)
		// 	} else {
		// 		response.Type = "logout"
		// 	}
		// 	notifications, err := s.repository.Message().GetTotalNotifications(response.Userid)
		// 	if err != nil {
		// 		log.Println("Notifications error:", err)
		// 	}
		// 	response.TotalNotifications = notifications
		// case "logout":
		// 	response = s.Logout(request)
		// 	s.removeClient(request["session"], client)
		// case "addpost":
		// 	response = s.AddPost(request)
		// 	s.BroadcastAddedContent(response)
		case "addcomment":
			// response = s.AddComment(request)
			// s.BroadcastAddedContent(response)
		case "getmessages":
			response = s.GetMessages(request)
			notifications, err := s.repository.Message().GetTotalNotifications(response.Userid)
			if err != nil {
				log.Println("Notifications error:", err)
			}
			response.TotalNotifications = notifications
		case "moremessages":
			response = s.GetMessages(request)
			notifications, err := s.repository.Message().GetTotalNotifications(response.Userid)
			if err != nil {
				log.Println("Notifications error:", err)
			}
			response.Type = "loadmoremssages"
			response.TotalNotifications = notifications
		case "sendmessage":
			response = s.AddMessage(request)
			s.SentToActiveRecipient(response)
		case "updateseenmessage":
			s.UpdateSeenMessage(request)
			response.Type = "updatetotal"
			userid := int(request["userid"].(float64))
			notifications, err := s.repository.Message().GetTotalNotifications(userid)
			if err != nil {
				log.Println("Error in Get Total:", err)
			}
			response.TotalNotifications = notifications
		case "typing":
			response = s.UpdateIsTyping(request)
			if response.Error == "" {
				s.SendIsTyping(response)
			}
		}
		s.updateClientTime(client)

		s.mu.Lock()

		if response.Session != "" {
			// response.Categories = s.GetCategoryAllData()
			response.AllUsers = s.FindAllUsers(response.Userid)
		}

		if response.Error != "" || (response.Type != "newmessage" && response.Type != "updatetyping") {
			client.WriteJSON(response)
		}
		if response.Type != "updatetyping" {
			s.BroadcastOnlineUsers()
		}

		s.mu.Unlock()
	}
}

func (s *Server) getClientConnections(userId int) []*Client {
	s.mu.Lock()
	defer s.mu.Unlock()

	targetedClients := []*Client{}
	for _, c := range s.clients {
		if c.Userid == userId {
			targetedClients = append(targetedClients, c)
		}
	}
	return targetedClients
}

func (s *Server) SentToActiveRecipient(response model.Response) {
	if response.Error != "" {
		return
	}

	for _, c := range s.getClientConnections(response.Message.SenderId) {
		s.ShowMessage(c, response)
	}

	for _, c := range s.getClientConnections(response.Message.RecipientId) {
		s.ShowMessage(c, response)
	}
}

func (s *Server) ShowMessage(client *Client, response model.Response) {
	if client == nil {
		return
	}

	notifications, err := s.repository.Message().GetTotalNotifications(client.Userid)
	if err != nil {
		log.Println("Error: ", err)
	}
	response.TotalNotifications = notifications
	client.Connection.WriteJSON(response)
}

func (s *Server) SendIsTyping(response model.Response) {
	clientsTargeted := s.getClientConnections(response.Userid)
	for _, c := range clientsTargeted {
		c.Connection.WriteJSON(response)
	}
}
