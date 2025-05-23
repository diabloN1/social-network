package controller

import (
	"context"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
)

// CORS Middleware to allow cross-origin requests and handle JSON
func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// // Allow CORS for the specified origin
		// w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		// w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		// w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		next.ServeHTTP(w, r)
	})
}

// CORS Middleware to allow cross-origin requests and handle JSON
func (s *Server) imageMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "session error:"+err.Error(), http.StatusBadRequest)
			return
		}

		res := s.ValidateSession(map[string]any{"session": cookie.Value})
		if res.Error != "" {
			http.Error(w, "session error:"+res.Error, http.StatusBadRequest)
			return
		}

		path := r.URL.Query().Get("path")
		if path == "" {
			http.Error(w, "query params path must", http.StatusBadRequest)
			return
		}
		typ := r.URL.Query().Get("type")
		if typ == "" {
			return
		}
		idStr := r.URL.Query().Get("id")
		if idStr == "" {
			return
		}
		id, err := strconv.Atoi(idStr)
		if err != nil {
			return
		}

		fullPath := filepath.Join("./static", typ, path)

		// Prevent directory traversal
		cleanPath := filepath.Clean(fullPath)
		if !strings.HasPrefix(cleanPath, filepath.Clean("./static")) {
			http.Error(w, "Invalid image path", http.StatusBadRequest)
			return
		}

		switch typ {
		case "posts":
			hasAccess, err := s.repository.Post().HasAccessToPost(res.Userid, id)
			if err != nil {
				http.Error(w, "error checkig if has access"+err.Error(), http.StatusBadRequest)
				return
			}

			if !hasAccess {
				http.Error(w, "Access forbidden", http.StatusForbidden)
				return
			}
		case "group-post":
			hasAccess, err := s.repository.Group().IsMember(res.Userid, id)
			if err != nil {
				http.Error(w, "error checkig if has access"+err.Error(), http.StatusBadRequest)
				return
			}

			if !hasAccess {
				http.Error(w, "Access forbidden", http.StatusForbidden)
				return
			}

		case "avatars":

		default:
			http.Error(w, "Invalid request type", http.StatusForbidden)
			return
		}
		ctx := context.WithValue(r.Context(), "fullPath", cleanPath)
		r = r.WithContext(ctx)
		fmt.Println("middleware passed")
		next.ServeHTTP(w, r)
	})
}

// func (s *Server) isMemberMiddleware(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		userID, ok := r.Context().Value("user_id").(float64)
// 		if !ok {
// 			http.Error(w, "Unauthorized: Missing user information or not float64", http.StatusUnauthorized)
// 			return
// 		}

// 		groupID := r.URL.Query().Get("group_id")

// 		if userID == 0 || groupID == "" {
// 			http.Error(w, "Unauthorized: Missing user or group information", http.StatusUnauthorized)
// 			return
// 		}

// 		isMember, err := s.repository.Group().IsMember(int(userID), int(groupID))
// 		if err != nil || !isMember {
// 			http.Error(w, "Forbidden: You are not a member of this group", http.StatusForbidden)
// 			return
// 		}
// 		next.ServeHTTP(w, r)
// 	})
// }
