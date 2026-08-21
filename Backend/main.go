package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"guardian-vision/backend/internal/config"
	"guardian-vision/backend/internal/database"
	"guardian-vision/backend/internal/handlers"
	"guardian-vision/backend/internal/middleware"
	"guardian-vision/backend/internal/routes"
	"guardian-vision/backend/internal/store"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg.DatabaseDSN)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	appStore := store.New(db)
	appHandlers := handlers.New(appStore, cfg)

	// ===== Router Selection =====
	// In production mode, the Go server serves both API + React SPA on the same port.
	// In development mode, only API routes are served; the frontend runs via Vite with its proxy.
	var router http.Handler
	if cfg.IsProduction {
		router = routes.NewWithSPA(appHandlers)
		log.Println("Running in PRODUCTION mode: serving API + React SPA on port", cfg.Port)
	} else {
		router = routes.New(appHandlers)
		log.Println("Running in DEVELOPMENT mode: serving API only on port", cfg.Port)
	}

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      middleware.CORS(cfg.AllowedOrigins)(middleware.RequestLogger(router)),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 20 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Guardian Vision server is running on http://localhost:%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen and serve: %v", err)
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("server shutdown: %v", err)
	}
}
