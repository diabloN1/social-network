package app

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func (app *App) UploadImage(r *http.Request) map[string]any {
	res := make(map[string]any)
	res["error"] = ""
	const maxBytes = 10 * 1024 * 1024

	err := r.ParseMultipartForm(maxBytes)
	if err != nil {
		res["error"] = err.Error()
		return res
	}

	targetPath := r.FormValue("path")
	fileName := r.FormValue("filename")
	if targetPath == "" || fileName == "" {
		res["error"] = "Missing 'path' or 'filename'"
		return res
	}

	file, fileHeaeder, err := r.FormFile("image")
	if err != nil {
		res["error"] = err.Error()
		return res
	}
	defer file.Close()

	if fileHeaeder.Size > maxBytes {
		res["error"] = "The image is beyond 10MB!"
		return res
	}

	// Create the directory if it doesn't exist
	dirPath := filepath.Join("./static", targetPath)
	err = os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		res["error"] = "Failed to create directory: " + err.Error()
		return res
	}

	destPath := filepath.Join(dirPath, fileName)

	dst, err := os.Create(destPath)
	if err != nil {
		res["error"] = "Failed to create file: " + err.Error()
		return res
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		res["error"] = "Failed to write file: " + err.Error()
		return res
	}

	return res
}

// func (s *Server) HasAccessProtectedImage(r *http.Request) (bool, string, error) {
// 	// (session, path, type, id)

// 	// Add session manually from cookie (like ValidateSession expects)
// 	cookie, err := r.Cookie("session_token")
// 	if err != nil {
// 		http.Error(w, "session error:"+err.Error(), http.StatusBadRequest)
// 		return false, "", err
// 	}

// 	res := s.ValidateSession(map[string]any{"session": cookie.Value})
// 	if res.Error != "" {
// 		http.Error(w, "session error:"+res.Error, http.StatusBadRequest)
// 		return false, "", err
// 	}

// 	path := r.URL.Query().Get("path")
// 	if path == "" {
// 		return false, "", errors.New("missing path")
// 	}
// 	typ := r.URL.Query().Get("type")
// 	if typ == "" {
// 		return false, "", errors.New("missing type")
// 	}
// 	idStr := r.URL.Query().Get("id")
// 	if idStr == "" {
// 		return false, "", errors.New("missing id")
// 	}
// 	id, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		return false, "", errors.New("invalid id")
// 	}

// 	switch typ {
// 	case "post":
// 		hasAccess, err := s.repository.Post().HasAccessToPost(res.Userid, id)
// 		return hasAccess, cleanPath, err
// 	case "group-post":
// 		hasAccess, err := s.repository.Group().IsMember(res.Userid, id)
// 		return hasAccess, cleanPath, err
// 	case "public":
// 		return true, cleanPath, nil
// 	default:
// 		return false, "", errors.New("invalid type")
// 	}
// }
