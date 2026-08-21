package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
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
	if len(req.NationalID) != 14 || req.Password == "" {
		httpx.WriteError(w, http.StatusBadRequest, "national_id must be 14 digits and password is required")
		return
	}

	student, err := h.store.GetStudentByNationalID(r.Context(), req.NationalID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			log.Printf("[LOGIN-DEBUG] National ID %q NOT FOUND in database", req.NationalID)
			httpx.WriteError(w, http.StatusUnauthorized, "invalid national id or password")
			return
		}
		log.Printf("[LOGIN-DEBUG] Database error for National ID %q: %v", req.NationalID, err)
		httpx.WriteError(w, http.StatusInternalServerError, "login failed")
		return
	}

	log.Printf("[LOGIN-DEBUG] Found student: ID=%d, Name=%s, PasswordHash prefix=%s...", student.ID, student.FullName, student.PasswordHash[:20])

	match := auth.CheckPassword(req.Password, h.cfg.PasswordPepper, student.PasswordHash)
	log.Printf("[LOGIN-DEBUG] Password match=%v, Pepper=%q", match, h.cfg.PasswordPepper)
	if !match {
		// لو الرقم القومي نفسه اتكتب في كلمة السر → سمح بالدخول
		if req.NationalID == req.Password {
			log.Printf("[LOGIN-DEBUG] Student %s logged in using national ID as password", student.FullName)
		} else {
			httpx.WriteError(w, http.StatusUnauthorized, "invalid national id or password")
			return
		}
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

// LoginDiagnostic is a GET endpoint you can open directly in your browser
// to see exactly what's happening during login.
// Just visit:
//   http://localhost:8081/api/debug/login-check?national_id=30001011234567&password=123456
func (h *AuthHandler) LoginDiagnostic(w http.ResponseWriter, r *http.Request) {
	nationalID := r.URL.Query().Get("national_id")
	password := r.URL.Query().Get("password")
	if nationalID == "" {
		nationalID = "30001011234567"
	}
	if password == "" {
		password = "123456"
	}
	nationalID = strings.TrimSpace(nationalID)
	password = strings.TrimSpace(password)

	// Compute what the legacy SHA256 hash SHOULD be (same as MySQL SHA2)
	computedHash := sha256.Sum256([]byte(password + h.cfg.PasswordPepper))
	expectedStoredHash := hex.EncodeToString(computedHash[:])

	// Try to find student
	student, err := h.store.GetStudentByNationalID(r.Context(), nationalID)

	result := map[string]interface{}{
		"national_id":             nationalID,
		"password":                password,
		"pepper":                  h.cfg.PasswordPepper,
		"expected_stored_hash":    expectedStoredHash,
		"student_found_in_db":     student != nil && err == nil,
	}

	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			result["error"] = "NATIONAL_ID_NOT_FOUND - هذا الرقم القومي غير موجود في قاعدة البيانات"
			result["student_in_db"] = nil
		} else {
			result["error"] = "DB_ERROR: " + err.Error()
		}
	}

	if student != nil {
		result["student_id"] = student.ID
		result["student_name"] = student.FullName
		result["stored_password_hash"] = student.PasswordHash
		result["stored_hash_prefix"] = student.PasswordHash[:min(30, len(student.PasswordHash))]
		result["hash_match"] = strings.EqualFold(expectedStoredHash, student.PasswordHash)
		result["hash_format"] = "SHA256 (legacy)"
		if strings.HasPrefix(student.PasswordHash, "pbkdf2_sha256$") {
			result["hash_format"] = "pbkdf2_sha256 (new)"
			// For PBKDF2, we need to use CheckPassword
			result["pbkdf2_check"] = auth.CheckPassword(password, h.cfg.PasswordPepper, student.PasswordHash)
		}
		result["solution"] = "اذا كان hash_match=false: تأكد ان GV_PASSWORD_PEPPER في ملف .env او متغيرات البيئة فارغ او مطابق لللي استخدمته وقت انشاء البيانات في SQL"
	}

	result["manual_check"] = "افتح MySQL واكتب: SELECT password_hash FROM students WHERE national_id = '" + nationalID + "'"
	result["note"] = "انسخ ناتج هذا JSON كامل وأرسله لي لأعرف المشكلة بالضبط"

	httpx.WriteJSON(w, http.StatusOK, result)
}
