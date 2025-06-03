package server

import (
	"net/http"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
)

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
