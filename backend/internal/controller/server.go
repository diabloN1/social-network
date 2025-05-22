package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	// "real-time-forum/internal/middleware"
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
	clients    map[int][]*Client
	mu         sync.RWMutex
}

type Client struct {
	Session    string
	ActiveTime time.Time
	UserId 	   int
	Connection *websocket.Conn
}

func Start() error {
	db, err := initDB("db/forum.db")
	if err != nil {
		return err
	}
	defer db.Close()

	s := NewServer(http.NewServeMux(), db)

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
	s.router.HandleFunc("/getMessages", s.GetMessagesHandler)

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
	receiverId := response["message"].(*model.Message).RecipientId
	groupId := response["message"].(*model.Message).GroupId

	for _, c := range s.clients[senderId] {
		response["isOwned"] = true
		s.ShowMessage(c, response)
	}

	if receiverId != 0 {
		// Brodcast to receiver
		for _, c := range s.clients[receiverId] {
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
