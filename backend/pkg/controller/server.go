package controller

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"real-time-forum/pkg/db/sqlite"
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

func (s *Server) AddRoute(pattern string, handler func(*request.RequestT) any, middlewares ...func(http.Handler, *request.RequestT) http.Handler) {
	h := HandlerFunc(handler)
	s.router.HandleFunc(pattern, func(resp http.ResponseWriter, req *http.Request) {
		body, err := io.ReadAll(req.Body)
		if err != nil {
			s.ServeError(resp, &response.Error{Cause: "oops, something went wrong", Code: 500})
			return
		}

		_, reqData, err := request.Unmarshal(body)
		if err != nil {
			s.ServeError(resp, &response.Error{Cause: err.Error(), Code: 500})
			return
		}

		reqData.Middlewares = middlewares
		handler := h.ApplyMiddlewares(reqData)
		s.cookieMiddleware(handler, reqData).ServeHTTP(resp, req)

	})
}

type HandlerFunc func(*request.RequestT) any

func (h HandlerFunc) ServeHTTP(w http.ResponseWriter, request *request.RequestT) {
	res := h(request)
	status, body := response.Marshal(res)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}

func (h HandlerFunc) ApplyMiddlewares(request *request.RequestT) http.Handler {
	var handler http.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.ServeHTTP(w, request)
	})

	for _, mw := range request.Middlewares {
		handler = mw(handler, request)
	}

	return handler

}

func (s *Server) ServeError(w http.ResponseWriter, err *response.Error) {
	fmt.Println("Error:", err.Cause)
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

	// Auth
	s.AddRoute("/login", s.Login)
	s.AddRoute("/register", s.Register)
	s.AddRoute("/logout", s.Logout)

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
	s.AddRoute("/requestFollow", s.RequestFollow)
	s.AddRoute("/acceptFollow", s.AcceptFollow)
	s.AddRoute("/deleteFollow", s.DeleteFollow)

	// Groups
	s.AddRoute("/createGroup", s.CreateGroup)
	s.AddRoute("/getGroups", s.GetGroups)
	s.AddRoute("/getGroup", s.GetGroupData)

	// Group post reactions and comments
	s.AddRoute("/reactToGroupPost", s.ReactToGroupPost, s.isMemberMiddleware)
	s.AddRoute("/addGroupComment", s.AddGroupComment, s.isMemberMiddleware)
	s.AddRoute("/getGroupComments", s.GetGroupComments, s.isMemberMiddleware)

	s.AddRoute("/addGroupPost", s.AddGroupPost, s.isMemberMiddleware)
	s.AddRoute("/addGroupEvent", s.AddGroupEvent, s.isMemberMiddleware)
	s.AddRoute("/addEventOption", s.AddEventOption, s.isMemberMiddleware)
	s.AddRoute("/requestJoinGroup", s.RequestJoinGroup)
	s.AddRoute("/respondToJoinRequest", s.RespondToJoinRequest)

	// Group Invitation Routes
	s.AddRoute("/getGroupInviteUsers", s.GetGroupInviteUsers, s.isMemberMiddleware)
	s.AddRoute("/inviteUserToGroup", s.InviteUserToGroup, s.isMemberMiddleware)
	s.AddRoute("/respondToGroupInvitation", s.RespondToGroupInvitation)

	// Chat
	s.AddRoute("/getChatData", s.GetChat)
	s.AddRoute("/getMessages", s.GetMessages)

	//notif
	s.AddRoute("/getAllNotifications", s.GetAllNotifications)
	s.AddRoute("/getNewFollowNotification", s.CheckNewFollowNotification)
	s.AddRoute("/deleteFollowNotif", s.DeleteFollowNotification)
	s.AddRoute("/deleteNotifNewEvent", s.DeleteNewEventNotification)

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
			return
		}
	}
}

func (s *Server) readMessage(conn *websocket.Conn, client *Client) {
	for {

		_, payload, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message: %v", err)
			}
			s.removeClient(client)
			break
		}

		reqType, reqBody, err := request.Unmarshal(payload)

		if err != nil {
			log.Println("Unmarshal payload err", err)
			return
		}

		switch reqType {
		// case "updateseenmessages":
		// 	s.UpdateSeenMessageWS(request)
		case "add-message":
			response, err := s.AddMessage(reqBody)
			if err != nil {
				s.ShowMessage(client, err)
				continue
			}
			s.SentToActiveRecipient(response)
		}
	}
}

func (s *Server) SentToActiveRecipient(response *response.AddMessage) {

	senderId := response.Message.SenderId
	RecipientId := response.Message.RecipientId
	groupId := response.Message.GroupId

	for _, c := range s.clients[senderId] {
		response.Message.IsOwned = true
		s.ShowMessage(c, response)
	}

	if RecipientId != 0 {
		// Brodcast to RecipientId
		for _, c := range s.clients[RecipientId] {
			response.Message.IsOwned = false
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
					response.Message.IsOwned = false
					s.ShowMessage(c, response)
				}
			}
		}
	}
}

func (s *Server) ShowMessage(client *Client, response any) {
	if client == nil {
		return
	}

	client.Connection.WriteJSON(response)
}
