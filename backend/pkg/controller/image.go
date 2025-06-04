package app

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
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

	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		res["error"] = err.Error()
		return res
	}
	defer file.Close()

	if fileHeader.Size > maxBytes {
		res["error"] = "The image is beyond 10MB!"
		return res
	}

	// Extension check
	ext := strings.ToLower(filepath.Ext(fileName))
	allowed := map[string]bool{
		".jpg": true,
		".jpeg": true,
		".png": true,
		".gif": true,
	}
	if !allowed[ext] {
		res["error"] = "Only .jpg, .jpeg, .png, .gif files are allowed"
		return res
	}

	// Create directory if it doesn't exist
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

