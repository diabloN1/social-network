package controller

import (
	"context"
	"net/http"
	"path/filepath"
	"real-time-forum/pkg/model/response"
	"strconv"
	"strings"
)

func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// // Allow CORS for the specified origin
		// w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		// w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		// w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Authorization")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(200)
			w.Write([]byte{})
			return
		}

		next.ServeHTTP(w, r)
	})
}

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
		id, err := strconv.Atoi(r.URL.Query().Get("id"))
		if err != nil {
			http.Error(w, "id is not a number", http.StatusBadRequest)
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
			hasAccess, err := s.repository.Post().HasAccessToPost(res.Userid, id, path)
			if err != nil {
				http.Error(w, "error checkig if has access"+err.Error(), http.StatusBadRequest)
				return
			}

			if !hasAccess {
				http.Error(w, "Access forbidden", http.StatusForbidden)
				return
			}
		case "post-comments":
			hasAccess, err := s.repository.Post().HasAccessToPostComment(res.Userid, id, path)
			if err != nil {
				http.Error(w, "error checkig if has access"+err.Error(), http.StatusBadRequest)
				return
			}

			if !hasAccess {
				http.Error(w, "Access forbidden", http.StatusForbidden)
				return
			}
		case "group-posts":
			hasAccess, err := s.repository.Group().HasAccessToGroupPost(res.Userid, id, path)
			if err != nil {
				http.Error(w, "error checkig if has access"+err.Error(), http.StatusBadRequest)
				return
			}

			if !hasAccess {
				http.Error(w, "Access forbidden", http.StatusForbidden)
				return
			}
		case "group-post-comments":
			postId, err := strconv.Atoi(r.URL.Query().Get("postId"))
			if err != nil {
				http.Error(w, "postId is not a number", http.StatusBadRequest)
				return
			}

			hasAccess, err := s.repository.Group().HasAccessToGroupComment(res.Userid, id, postId, path)
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
		next.ServeHTTP(w, r)
	})
}

func (s *Server) isMemberMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("user_id").(int)
		if !ok || userID == 0 {
			http.Error(w, "Unauthorized: Missing or invalid user information", http.StatusUnauthorized)
			return
		}

		groupIDStr := r.URL.Query().Get("group_id")
		if groupIDStr == "" {
			http.Error(w, "Bad Request: Missing group_id parameter", http.StatusBadRequest)
			return
		}

		groupID, err := strconv.Atoi(groupIDStr)
		if err != nil || groupID <= 0 {
			http.Error(w, "Bad Request: Invalid group_id parameter", http.StatusBadRequest)
			return
		}

		isMember, err := s.repository.Group().IsMember(userID, groupID)
		if err != nil {
			http.Error(w, "Internal Server Error: Unable to verify membership", http.StatusInternalServerError)
			return
		}

		if !isMember {
			http.Error(w, "Forbidden: You are not a member of this group", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) cookieMiddleware(next HandlerFunc, req *RequestT) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/login" || r.URL.Path == "/register" {
			next.ServeHTTP(w, req)
			return
		}

		cookie, err := r.Cookie("token")
		if err != nil {
			next.ServeError(w, &response.Error{Cause: "unauthorized: invalid session in "+ r.URL.Path, Code: http.StatusUnauthorized})
			return
		}

		token := cookie.Value
		uid, err := s.repository.Session().FindUserIDBySession(token)
		if err != nil {
			next.ServeError(w, &response.Error{Cause: "unauthorized: invalid session", Code: http.StatusUnauthorized})
			return
		}

		req.context["user_id"] = uid
		next.ServeHTTP(w, req)
	})
}
