package server

import (
	"database/sql"
	"io"
	"net/http"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"real-time-forum/pkg/repository"

	controller "real-time-forum/pkg/controller"
)

type Server struct {
	router *http.ServeMux
	app    *controller.App
}

func NewServer(router *http.ServeMux, db *sql.DB) *Server {
	return &Server{
		router: router,
		app:    controller.NewApp(repository.New(db)),
	}
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
		s.app.CookieMiddleware(handler, reqData).ServeHTTP(resp, req)

	})
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}
