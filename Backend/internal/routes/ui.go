package routes

import (
	"io/fs"
	"net/http"
	"os"
	"path"
	"strings"

	"guardian-vision/backend/internal/static"
)

// spaHandler serves the React SPA (Single Page Application).
// It serves embedded static files from the Go binary when built with
// CGO_ENABLED=0 go build -o server .
// During development, it falls back to reading the filesystem directly
// if the embedded dist directory is not available (i.e., before building
// the frontend).
type spaHandler struct {
	staticFS   fs.FS
	fileServer http.Handler
}

// newSPAHandler creates an SPA handler that:
//  1. Tries the embedded filesystem first (production binary).
//  2. If the embedded FS has no files, falls back to the actual dist directory on disk.
//
// The embedded "dist" directory is mounted with fs.Sub so that
// index.html is at the root of the returned filesystem.
func newSPAHandler() (spaHandler, error) {
	// === Strategy 1: Use embedded filesystem (production binary) ===
	if staticFS, err := fs.Sub(static.Files, "dist"); err == nil {
		if _, err := fs.ReadDir(staticFS, "."); err == nil {
			// Embedded dist/ exists and is readable — use it.
			return spaHandler{
				staticFS:   staticFS,
				fileServer: http.FileServer(http.FS(staticFS)),
			}, nil
		}
	}

	// === Strategy 2: Fall back to on-disk dist/ ===
	// This covers development builds or running the binary from a directory
	// where the frontend build was copied.
	candidatePaths := []string{
		"internal/static/dist",
		"../internal/static/dist",
		"Backend/internal/static/dist",
	}

	for _, p := range candidatePaths {
		if _, err := os.Stat(p); err == nil {
			diskFS := os.DirFS(p)
			return spaHandler{
				staticFS:   diskFS,
				fileServer: http.FileServer(http.FS(diskFS)),
			}, nil
		}
	}

	// === No static files found anywhere ===
	// Return a handler that always returns a clear error page.
	return spaHandler{
		staticFS:   nil,
		fileServer: http.NotFoundHandler(),
	}, nil
}

func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Clean the path to prevent directory traversal attacks
	cleanPath := path.Clean(r.URL.Path)

	// If the request is for the root or a known static asset extension,
	// try to serve the file directly.
	if cleanPath == "/" || cleanPath == "/index.html" {
		h.serveFile(w, r, "index.html")
		return
	}

	// Check if the requested file exists in the static FS
	if h.fileExists(cleanPath) {
		h.fileServer.ServeHTTP(w, r)
		return
	}

	// For SPA routing, serve index.html for any non-API, non-file path.
	// This allows React Router to handle routes like /dashboard, /profile, etc.
	if !strings.HasPrefix(r.URL.Path, "/api/") {
		h.serveFile(w, r, "index.html")
		return
	}

	// If it's an API path and the file wasn't found, let it 404 through
	http.NotFound(w, r)
}

func (h spaHandler) fileExists(p string) bool {
	p = strings.TrimPrefix(p, "/")
	_, err := fs.Stat(h.staticFS, p)
	return err == nil
}

func (h spaHandler) serveFile(w http.ResponseWriter, r *http.Request, filename string) {
	data, err := fs.ReadFile(h.staticFS, filename)
	if err != nil {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}

	// Set correct Content-Type based on file extension
	contentType := detectContentType(filename)
	w.Header().Set("Content-Type", contentType)
	w.Write(data)
}

func detectContentType(filename string) string {
	switch {
	case strings.HasSuffix(filename, ".html"):
		return "text/html; charset=utf-8"
	case strings.HasSuffix(filename, ".js"):
		return "application/javascript; charset=utf-8"
	case strings.HasSuffix(filename, ".css"):
		return "text/css; charset=utf-8"
	case strings.HasSuffix(filename, ".json"):
		return "application/json"
	case strings.HasSuffix(filename, ".png"):
		return "image/png"
	case strings.HasSuffix(filename, ".jpg"), strings.HasSuffix(filename, ".jpeg"):
		return "image/jpeg"
	case strings.HasSuffix(filename, ".svg"):
		return "image/svg+xml"
	case strings.HasSuffix(filename, ".ico"):
		return "image/x-icon"
	case strings.HasSuffix(filename, ".woff"):
		return "font/woff"
	case strings.HasSuffix(filename, ".woff2"):
		return "font/woff2"
	default:
		return "application/octet-stream"
	}
}