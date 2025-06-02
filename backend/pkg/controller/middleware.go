package app

import (
	"context"
	"net/http"
	"path/filepath"
	"real-time-forum/pkg/model/request"
	"real-time-forum/pkg/model/response"
	"reflect"
	"strconv"
	"strings"
)

func (app *App) CorsMiddleware(next http.Handler) http.Handler {
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

func (app *App) ImageMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "session error:"+err.Error(), http.StatusBadRequest)
			return
		}

		uid, err := app.repository.Session().FindUserIDBySession(cookie.Value)
		if err != nil {
			app.ServeError(w, &response.Error{Cause: "unauthorized: invalid session", Code: http.StatusUnauthorized})
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
			hasAccess, err := app.repository.Post().HasAccessToPost(uid, id, path)
			if err != nil {
				http.Error(w, "error checkig if has access"+err.Error(), http.StatusBadRequest)
				return
			}

			if !hasAccess {
				http.Error(w, "Access forbidden", http.StatusForbidden)
				return
			}
		case "post-comments":
			hasAccess, err := app.repository.Post().HasAccessToPostComment(uid, id, path)
			if err != nil {
				http.Error(w, "error checkig if has access"+err.Error(), http.StatusBadRequest)
				return
			}

			if !hasAccess {
				http.Error(w, "Access forbidden", http.StatusForbidden)
				return
			}
		case "group-posts":
			hasAccess, err := app.repository.Group().HasAccessToGroupPost(uid, id, path)
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

			hasAccess, err := app.repository.Group().HasAccessToGroupComment(uid, id, postId, path)
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

func (app *App) IsMemberMiddleware(next http.Handler, req *request.RequestT) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := req.Ctx.Value("user_id").(int)
		if !ok || userID == 0 {
			app.ServeError(w, &response.Error{Cause: "Unauthorized: User ID not found in context", Code: http.StatusBadRequest})
			return
		}

		v := reflect.ValueOf(req.Data).Elem()

		if v.Kind() != reflect.Struct {
			app.ServeError(w, &response.Error{Cause: "Bad Request: Expected struct data", Code: http.StatusBadRequest})
			return
		}

		groupField := v.FieldByName("GroupId")
		if !groupField.IsValid() {
			app.ServeError(w, &response.Error{Cause: "Bad Request: GroupId field missing or invalid", Code: http.StatusBadRequest})
			return
		}

		groupId := int(groupField.Int())
		if groupId <= 0 {
			app.ServeError(w, &response.Error{Cause: "Bad Request: Invalid group_id", Code: http.StatusBadRequest})
			return
		}

		isMember, err := app.repository.Group().IsMember(userID, groupId)
		if err != nil {
			app.ServeError(w, &response.Error{Cause: "Internal Server Error: Unable to verify membership", Code: http.StatusInternalServerError})
			return
		}

		if !isMember {
			app.ServeError(w, &response.Error{Cause: "Forbidden: You are not a member of this group", Code: http.StatusForbidden})
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (app *App) CookieMiddleware(next http.Handler, req *request.RequestT) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/login" || r.URL.Path == "/register" {
			next.ServeHTTP(w, r)
			return
		}

		cookie, err := r.Cookie("token")
		if err != nil {
			app.ServeError(w, &response.Error{Cause: "unauthorized: invalid session in " + r.URL.Path, Code: http.StatusUnauthorized})
			return
		}

		token := cookie.Value
		uid, err := app.repository.Session().FindUserIDBySession(token)
		if err != nil {
			app.ServeError(w, &response.Error{Cause: "unauthorized: invalid session", Code: http.StatusUnauthorized})
			return
		}

		req.Ctx = context.WithValue(r.Context(), "user_id", uid)
		req.Ctx = context.WithValue(req.Ctx, "token", token)
		next.ServeHTTP(w, r)
	})
}
