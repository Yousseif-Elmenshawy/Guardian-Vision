package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"guardian-vision/backend/internal/httpx"
	"guardian-vision/backend/internal/middleware"
	"guardian-vision/backend/internal/store"
)

type StudentHandler struct {
	store *store.Store
}

func (h *StudentHandler) Me(w http.ResponseWriter, r *http.Request) {
	studentID, ok := middleware.StudentIDFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "missing authenticated student")
		return
	}

	student, err := h.store.GetStudentByID(r.Context(), studentID)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, student)
}

func (h *StudentHandler) Performance(w http.ResponseWriter, r *http.Request) {
	studentID, ok := middleware.StudentIDFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "missing authenticated student")
		return
	}

	items, err := h.store.ListMonthlyPerformance(r.Context(), studentID)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, items)
}

func (h *StudentHandler) Subjects(w http.ResponseWriter, r *http.Request) {
	studentID, ok := middleware.StudentIDFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "missing authenticated student")
		return
	}

	var monthID int64
	if value := r.URL.Query().Get("month_id"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			httpx.BadRequest(w, err)
			return
		}
		monthID = parsed
	}

	items, err := h.store.ListStudentSubjects(r.Context(), studentID, monthID)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, items)
}

func (h *StudentHandler) SubjectDetail(w http.ResponseWriter, r *http.Request) {
	studentID, ok := middleware.StudentIDFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "missing authenticated student")
		return
	}

	subjectID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		httpx.BadRequest(w, err)
		return
	}

	item, err := h.store.GetStudentSubjectDetail(r.Context(), studentID, subjectID)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, item)
}

func writeStoreError(w http.ResponseWriter, err error) {
	if errors.Is(err, store.ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "resource not found")
		return
	}
	httpx.WriteError(w, http.StatusInternalServerError, "internal server error")
}
