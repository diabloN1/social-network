package app

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"social-network/pkg/model/response"
	"strings"
)

func (app *App) UploadImage(w http.ResponseWriter, r *http.Request) {

	const maxBytes = 10 * 1024 * 1024

	err := r.ParseMultipartForm(maxBytes)
	if err != nil {
		app.ServeError(w, &response.Error{Cause: err.Error(), Code: 400})
		return
	}

	targetPath := r.FormValue("path")
	fileName := r.FormValue("filename")
	if targetPath == "" || fileName == "" {
		app.ServeError(w, &response.Error{Cause: "Invalid path or filename", Code: 400})
		return
	}

	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		app.ServeError(w, &response.Error{Cause: err.Error(), Code: 400})
		return
	}
	defer file.Close()

	if fileHeader.Size > maxBytes {
		app.ServeError(w, &response.Error{Cause: "You exeeded the allowed size", Code: 400})
		return
	}

	// Extension check
	ext := strings.ToLower(filepath.Ext(fileName))
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
	}
	if !allowed[ext] {
		app.ServeError(w, &response.Error{Cause: "Only .jpg, .jpeg, .png, .gif files are allowed", Code: 400})
		return
	}

	// Create directory if it doesn't exist
	dirPath := filepath.Join("./static", targetPath)
	err = os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		app.ServeError(w, &response.Error{Cause: err.Error(), Code: 500})
		return
	}

	destPath := filepath.Join(dirPath, fileName)

	dst, err := os.Create(destPath)
	if err != nil {
		app.ServeError(w, &response.Error{Cause: err.Error(), Code: 500})
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {

		app.ServeError(w, &response.Error{Cause: err.Error(), Code: 500})
		return
	}

	w.WriteHeader(200)
	w.Write([]byte("File saved successfully"))
}
