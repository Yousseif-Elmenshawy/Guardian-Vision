package handlers

import (
	"net/http"

	"guardian-vision/backend/internal/httpx"
	"guardian-vision/backend/internal/store"
)

type HealthHandler struct {
	store *store.Store
}

func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	if err := h.store.Ping(r.Context()); err != nil {
		httpx.WriteError(w, http.StatusServiceUnavailable, "database is not reachable")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}
