package middleware

import (
	"net/http"
	"strings"

	"guardian-vision/backend/internal/auth"
	"guardian-vision/backend/internal/httpx"
)

func RequireAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			token := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
			if token == "" || token == header {
				httpx.WriteError(w, http.StatusUnauthorized, "missing bearer token")
				return
			}

			payload, err := auth.ParseToken(secret, token)
			if err != nil {
				httpx.WriteError(w, http.StatusUnauthorized, err.Error())
				return
			}

			next.ServeHTTP(w, r.WithContext(WithStudentID(r.Context(), payload.StudentID)))
		})
	}
}
