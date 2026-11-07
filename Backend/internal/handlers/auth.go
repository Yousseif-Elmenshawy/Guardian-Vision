package handlers

import (
	"errors"
	"net/http"
	"strings"

	"guardian-vision/backend/internal/auth"
	"guardian-vision/backend/internal/config"
	"guardian-vision/backend/internal/httpx"
	"guardian-vision/backend/internal/store"
)

type AuthHandler struct {
	store *store.Store
	cfg   config.Config
}

func (h *AuthHandler) TokenSecret() string {
	return h.cfg.TokenSecret
}

type loginRequest struct {
	NationalID string `json:"national_id"`
	Password   string `json:"password"`
	MajorCode  string `json:"major_code,omitempty"`
}

type loginResponse struct {
	Token   string `json:"token"`
	Student any    `json:"student"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := httpx.ReadJSON(r, &req); err != nil {
		httpx.BadRequest(w, err)
		return
	}

	req.NationalID = strings.TrimSpace(req.NationalID)
	req.Password = strings.TrimSpace(req.Password)
	req.MajorCode = strings.TrimSpace(req.MajorCode)
	if len(req.NationalID) != 14 || !isNationalID(req.NationalID) || req.Password == "" {
		httpx.WriteError(w, http.StatusBadRequest, "national_id must be 14 digits and password is required")
		return
	}

	student, err := h.store.GetStudentByNationalID(r.Context(), req.NationalID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			httpx.WriteError(w, http.StatusUnauthorized, "invalid national id or password")
			return
		}
		httpx.WriteError(w, http.StatusInternalServerError, "login failed")
		return
	}

	if !auth.CheckPassword(req.Password, h.cfg.PasswordPepper, student.PasswordHash) {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid national id or password")
		return
	}

	if req.MajorCode != "" {
		if student.MajorCode == nil || !strings.EqualFold(*student.MajorCode, req.MajorCode) {
			httpx.WriteError(w, http.StatusForbidden, "selected major does not match student profile")
			return
		}
	}

	token, err := auth.GenerateToken(h.cfg.TokenSecret, student.ID, h.cfg.TokenTTL)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, loginResponse{
		Token:   token,
		Student: student.Student,
	})
}

func isNationalID(value string) bool {
	for _, digit := range value {
		if digit < '0' || digit > '9' {
			return false
		}
	}
	return true
}
