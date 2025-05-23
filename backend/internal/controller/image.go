package controller

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func (s *Server) UploadImage(r *http.Request) map[string]any {
	res := make(map[string]any)
	res["error"] = ""
	const maxBytes = 10 * 1024 * 1024

	err := r.ParseMultipartForm(maxBytes)
	if err != nil {
		res["error"] = err.Error()
		return res
	}

	// --- Get form values ---
	targetPath := r.FormValue("path")
	fileName := r.FormValue("filename")
	if targetPath == "" || fileName == "" {
		res["error"] = "Missing 'path' or 'filename'"
		return res
	}

	// --- Get image file ---
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

	destPath := filepath.Join("./static/", targetPath, fileName)

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

func (s *Server) GetImage(path string) 