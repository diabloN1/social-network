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
	router *http.ServeMux
	app    *App
}

type App struct {
	repository repository.Repository
	clients    map[int][]*Client
	mu         sync.Mutex
	upgrader   *websocket.Upgrader
}

func (s *Server) AddRoute(pattern string, handler func(*request.RequestT) any, middlewares ...func(http.Handler, *request.RequestT) http.Handler) {
	h := HandlerFunc(handler)
	s.router.HandleFunc(pattern, func(resp http.ResponseWriter, req *http.Request) {
		body, err := io.ReadAll(req.Body)
		if err != nil {
			s.app.ServeError(resp, &response.Error{Cause: "oops, something went wrong", Code: 500})
			return
		}

		_, reqData, err := request.Unmarshal(body)
		if err != nil {
			s.app.ServeError(resp, &response.Error{Cause: err.Error(), Code: 500})
			return
		}

		reqData.Middlewares = middlewares
		handler := h.ApplyMiddlewares(reqData)
		s.app.cookieMiddleware(handler, reqData).ServeHTTP(resp, req)

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

func (app *App) ServeError(w http.ResponseWriter, err *response.Error) {
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
	s.AddRoute("/reactToGroupPost", s.app.ReactToGroupPost, s.app.isMemberMiddleware)
	s.AddRoute("/addGroupComment", s.app.AddGroupComment, s.app.isMemberMiddleware)
	s.AddRoute("/getGroupComments", s.app.GetGroupComments, s.app.isMemberMiddleware)

	s.AddRoute("/addGroupPost", s.app.AddGroupPost, s.app.isMemberMiddleware)
	s.AddRoute("/addGroupEvent", s.app.AddGroupEvent, s.app.isMemberMiddleware)
	s.AddRoute("/addEventOption", s.app.AddEventOption, s.app.isMemberMiddleware)
	s.AddRoute("/requestJoinGroup", s.app.RequestJoinGroup)
	s.AddRoute("/respondToJoinRequest", s.app.RespondToJoinRequest)

	// Group Invitation Routes
	s.AddRoute("/getGroupInviteUsers", s.app.GetGroupInviteUsers, s.app.isMemberMiddleware)
	s.AddRoute("/inviteUserToGroup", s.app.InviteUserToGroup, s.app.isMemberMiddleware)
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
	s.router.Handle("/getProtectedImage", s.app.imageMiddleware(http.HandlerFunc(s.app.ProtectedImageHandler)))

	// go s.checkClientsLastActivity()

	log.Println("Server started at http://localhost:8080/")
	return http.ListenAndServe(":8080", s.app.corsMiddleware(s))
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
	app := &App{
		repository: *repository.New(db),
		upgrader: upgrader,
		clients:  make(map[int][]*Client),
	}

	return &Server{
		router: router,
		app:    app,
	}
}

func (app *App) addClient(userid int, session string, client *websocket.Conn) *Client {
	app.mu.Lock()
	defer app.mu.Unlock()
	c := &Client{UserId: userid, Session: session, ActiveTime: time.Now(), Connection: client}
	app.clients[userid] = append(app.clients[userid], c)
	return c
}

func (app *App) removeClient(client *Client) {
	app.mu.Lock()
	defer app.mu.Unlock()

	for i, c := range app.clients[client.UserId] {
		if c == client {

			if i == len(app.clients[client.UserId])-1 {
				app.clients[client.UserId] = app.clients[client.UserId][:i]
			} else {
				app.clients[client.UserId] = append(app.clients[client.UserId][:i], app.clients[client.UserId][i+1:]...)
			}
			return
		}
	}
}

func (app *App) readMessage(conn *websocket.Conn, client *Client) {
	for {

		_, payload, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message: %v", err)
			}
			app.removeClient(client)
			break
		}

		reqType, reqBody, err := request.Unmarshal(payload)

		if err != nil {
			log.Println("Unmarshal payload err", err)
			return
		}

		switch reqType {
		case "updateseenmessages":
			app.UpdateSeenMessageWS(reqBody)
		case "add-message":
			response, err := app.AddMessage(reqBody)
			if err != nil {
				app.ShowMessage(client, err)
				continue
			}
			app.SentToActiveRecipient(response)
		}
	}
}

func (app *App) SentToActiveRecipient(response *response.AddMessage) {

	senderId := response.Message.SenderId
	RecipientId := response.Message.RecipientId
	groupId := response.Message.GroupId

	for _, c := range app.clients[senderId] {
		response.Message.IsOwned = true
		app.ShowMessage(c, response)
	}

	if RecipientId != 0 {
		// Brodcast to RecipientId
		for _, c := range app.clients[RecipientId] {
			response.Message.IsOwned = false
			app.ShowMessage(c, response)
		}
	} else {
		// Brodcast to group members
		users, err := app.repository.Group().GetGroupMembers(groupId)
		if err != nil {
			fmt.Println("Error broadcasting to group members:", err)
			return
		}

		for _, u := range users {
			if u.ID != senderId {
				for _, c := range app.clients[u.ID] {
					response.Message.IsOwned = false
					app.ShowMessage(c, response)
				}
			}
		}
	}
}

func (app *App) ShowMessage(client *Client, response any) {
	if client == nil {
		return
	}

	client.Connection.WriteJSON(response)
}
