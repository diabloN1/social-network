package controller

import (
	"net/http"
)

func (s *Server) Home(w http.ResponseWriter, r *http.Request) {
	// if r.Header.Get("Upgrade") == "websocket" {
	// 	conn, err := s.upgrader.Upgrade(w, r, nil)
	// 	if err != nil {
	// 		log.Println(err)
	// 		return
	// 	}

	// 	go s.readMessage(conn)

	// } else {
	// 	// Render the HTML template with the data
	// 	tmpl, err := template.ParseFiles("index.html")
	// 	if err != nil {
	// 		log.Println("Server Could not parse templates", 500)
	// 		return
	// 	}
	// 	err = tmpl.Execute(w, r)
	// 	if err != nil {
	// 		log.Println(err)
	// 		return
	// 	}
	// }
}

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
func (s *Server) AddPostHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AddPost(request)
	s.SendJson(w, response, err)
}