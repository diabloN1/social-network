package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"real-time-forum/pkg/repository"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"slices"
)

type App struct {
	repository repository.Repository
	clients    map[int][]*Client
	mu         sync.Mutex
	upgrader   *websocket.Upgrader
}

type Client struct {
	Session    string
	ActiveTime time.Time
	UserId     int
	Connection *websocket.Conn
}

func NewApp(repository *repository.Repository) *App {
	upgrader := &websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	return &App{
		repository: *repository,
		upgrader:   upgrader,
		clients:    make(map[int][]*Client),
	}
}

func (app *App) ServeError(w http.ResponseWriter, err *response.Error) {
	fmt.Println("Error:", err.Cause)
	status, body := response.Marshal(err)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
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

			fmt.Println("Removing client:", client.UserId, "Session:", client.Session, len(app.clients[client.UserId]))
			if i == len(app.clients[client.UserId])-1 {
				app.clients[client.UserId] = app.clients[client.UserId][:i]
			} else {
				app.clients[client.UserId] = slices.Delete(app.clients[client.UserId], i, i+1)
			}
			fmt.Println(app.clients[client.UserId], "after remove client")
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

		session := app.GetReflectValue(reqBody, "Session", "string")

		fmt.Println("session", session)
		if session == nil || session.(string) != client.Session {
			app.ShowMessage(client, &response.Error{
				Code:  401,
				Cause: "unauthorized: invalid session111",
			})
			app.removeClient(client)
			break
		}

		uid, err := app.repository.Session().FindUserIDBySession(session.(string))
		if err != nil {
			app.ShowMessage(client, &response.Error{
				Code:  401,
				Cause: "unauthorized: invalid session",
			})
			app.removeClient(client)
			break
		}
		reqBody.Ctx = context.WithValue(context.Background(), "user_id", uid)
		switch reqType {
		case "update-seen-messages":
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
		response.Message.IsOwned = false

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

func (app *App) ShowMessage(client *Client, res any) {
	if client == nil {
		return
	}

	_, data := response.Marshal(res)

	client.Connection.WriteMessage(websocket.TextMessage, data)
}
