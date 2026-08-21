package handlers

import (
	"net/http"

	"guardian-vision/backend/internal/httpx"
	"guardian-vision/backend/internal/store"
)

type CatalogHandler struct {
	store *store.Store
}

func (h *CatalogHandler) Grades(w http.ResponseWriter, r *http.Request) {
	grades, err := h.store.ListGrades(r.Context())
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, grades)
}

func (h *CatalogHandler) Majors(w http.ResponseWriter, r *http.Request) {
	majors, err := h.store.ListMajors(r.Context())
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, majors)
}
