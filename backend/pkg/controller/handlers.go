package controller

import (
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

// Images
func (s *Server) UploadImageHandler(w http.ResponseWriter, r *http.Request) {
	s.SendJson(w, s.UploadImage(r), nil)
}

func (s *Server) ProtectedImageHandler(w http.ResponseWriter, r *http.Request) {
	fullPath, ok := r.Context().Value("fullPath").(string)

	if !ok || fullPath == "" {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	http.ServeFile(w, r, fullPath)
}
