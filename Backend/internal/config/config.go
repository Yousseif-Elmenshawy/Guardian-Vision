package config

import (
	"os"
	"strings"
	"time"
)

type Config struct {
	Port           string
	DatabaseDSN    string
	TokenSecret    string
	PasswordPepper string
	TokenTTL       time.Duration
	AllowedOrigins []string
	IsProduction   bool
}

func Load() Config {
	port := getEnv("GV_PORT", "8081")

	// Default allowed origins for development (Vite dev server)
	defaultOrigins := "http://localhost:5173,http://127.0.0.1:5173"

	// In production, the Go server serves both API and frontend on the same port,
	// so we should also allow the production port itself.
	productionEnv := getEnv("GV_ENV", "development") == "production"
	if productionEnv {
		defaultOrigins = "http://localhost:" + port + ",http://127.0.0.1:" + port
	}

	return Config{
		Port:           port,
		DatabaseDSN:    getEnv("GV_DB_DSN", "root:@tcp(127.0.0.1:3306)/guardian_vision?parseTime=true&charset=utf8mb4&loc=Local"),
		TokenSecret:    getEnv("GV_TOKEN_SECRET", "dev-secret-change-me"),
		PasswordPepper: getEnv("GV_PASSWORD_PEPPER", ""),
		TokenTTL:       24 * time.Hour,
		AllowedOrigins: splitCSV(getEnv("GV_ALLOWED_ORIGINS", defaultOrigins)),
		IsProduction:   productionEnv,
	}
}

func getEnv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}
