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

// AUTH Handlers
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

// POST Handlers
func (s *Server) AddPostHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AddPost(request)
	s.SendJson(w, response, err)
}

func (s *Server) getPostsHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetPosts(request)
	s.SendJson(w, response, err)
}

func (s *Server) getPostHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetPostData(request)
	s.SendJson(w, response, err)
}

// PROFILE Handlers
func (s *Server) getProfileHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetProfile(request)
	s.SendJson(w, response, err)
}

// Follow Handlers
func (s *Server) requestFollowHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.RequestFollow(request)
	s.SendJson(w, response, err)
}

func (s *Server) acceptFollowHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.AcceptFollow(request)
	s.SendJson(w, response, err)
}

func (s *Server) deleteFollowHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.DeleteFollow(request)
	s.SendJson(w, response, err)
}

func (s *Server) SetPrivacyHandler(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.setProfilePrivacy(request)
	s.SendJson(w, response, err)
}

func (s *Server) GetProfilesHanlder(w http.ResponseWriter, r *http.Request) {

	request, err := s.ReadRequest(r.Body)
	response := s.GetProfiles(request)
	s.SendJson(w, response, err)
}
