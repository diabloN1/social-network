package app

import (
	"log"
	"net/http"
)

func (app *App) WebSocketHandler(w http.ResponseWriter, r *http.Request) {

	if r.Header.Get("Upgrade") == "websocket" {
		conn, err := app.upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err.Error())
			return
		}

		token := r.FormValue("session")
		uid, err := app.repository.Session().FindUserIDBySession(token)
		if err != nil {
			log.Println("Session was not found!")
			return
		}

		client := app.addClient(uid, token, conn)

		go app.readMessage(conn, client)

	}
}

func (app *App) UploadImageHandler(w http.ResponseWriter, r *http.Request) {
	app.SendJson(w, app.UploadImage(r), nil)
}

func (app *App) ProtectedImageHandler(w http.ResponseWriter, r *http.Request) {
	fullPath, ok := r.Context().Value("fullPath").(string)

	if !ok || fullPath == "" {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	http.ServeFile(w, r, fullPath)
}
