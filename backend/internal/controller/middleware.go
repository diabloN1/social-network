package controller

import "net/http"

// CORS Middleware to allow cross-origin requests and handle JSON
func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow CORS for the specified origin
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")           
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		next.ServeHTTP(w, r)
	})
}
