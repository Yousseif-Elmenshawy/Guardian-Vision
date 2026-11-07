package routes

import (
	"log"
	"net/http"

	"guardian-vision/backend/internal/handlers"
	"guardian-vision/backend/internal/middleware"
)

// New creates the main HTTP handler with all API routes and SPA file serving.
// In production mode (GV_ENV=production), the React build is served by the Go server.
// In development mode, the API routes are served and the frontend runs separately via Vite proxy.
func New(h *handlers.Handlers) http.Handler {
	mux := http.NewServeMux()

	// ===== API Routes =====
	mux.HandleFunc("GET /api/health", h.Health.Check)
	mux.HandleFunc("POST /api/auth/login", h.Auth.Login)

	// Registration validation endpoint — checks national ID before full registration
	mux.HandleFunc("POST /api/registration/validate-national-id", h.Registration.ValidateNationalID)

	mux.HandleFunc("GET /api/grades", h.Catalog.Grades)
	mux.HandleFunc("GET /api/majors", h.Catalog.Majors)
	mux.HandleFunc("GET /api/uniform/products", h.Uniform.Products)
	mux.HandleFunc("GET /api/uniform/sizes", h.Uniform.Sizes)
	mux.HandleFunc("POST /api/uniform/orders", h.Uniform.CreateOrder)

	requireAuth := middleware.RequireAuth(h.Auth.TokenSecret())
	mux.Handle("GET /api/students/me", requireAuth(http.HandlerFunc(h.Student.Me)))
	mux.Handle("GET /api/students/me/performance", requireAuth(http.HandlerFunc(h.Student.Performance)))
	mux.Handle("GET /api/students/me/subjects", requireAuth(http.HandlerFunc(h.Student.Subjects)))
	mux.Handle("GET /api/students/me/subjects/{id}", requireAuth(http.HandlerFunc(h.Student.SubjectDetail)))
	mux.Handle("GET /api/uniform/orders/me", requireAuth(http.HandlerFunc(h.Uniform.MyOrders)))

	return mux
}

// NewWithSPA returns a handler that wraps API routes with SPA file serving.
// Use this in production builds where the Go server serves both API and frontend.
func NewWithSPA(h *handlers.Handlers) http.Handler {
	apiHandler := New(h)
	spa, err := newSPAHandler()
	if err != nil {
		log.Printf("warning: SPA handler initialization failed: %v", err)
		return apiHandler
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If the request starts with /api/, route to the API handler
		if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
			apiHandler.ServeHTTP(w, r)
			return
		}

		// Otherwise, serve the SPA (React app)
		spa.ServeHTTP(w, r)
	})
}
