package handlers

import (
	"net/http"
	"strings"

	"guardian-vision/backend/internal/httpx"
	"guardian-vision/backend/internal/store"
)

// RegistrationHandler handles pre-registration validation steps,
// such as verifying that the national ID exists in the database
// before allowing the user to proceed with a full registration form.
type RegistrationHandler struct {
	store *store.Store
}

// validateNationalIDRequest is the JSON body expected from the frontend
// when the user submits their national ID for validation.
type validateNationalIDRequest struct {
	NationalID string `json:"national_id"`
}

// ---------------------------------------------------------------------------
// Response structures
// ---------------------------------------------------------------------------

// ValidateNationalIDSuccessResponse is returned when the national ID exists
// in the database. The frontend can use the included student info to
// pre-fill fields or confirm the user's identity.
type ValidateNationalIDSuccessResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	StudentID int64  `json:"student_id"`
	FullName  string `json:"full_name"`
	GradeID   int64  `json:"grade_id"`
	GradeName string `json:"grade_name"`
	MajorCode string `json:"major_code,omitempty"`
	MajorName string `json:"major_name,omitempty"`
}

// ValidateNationalIDErrorResponse is returned when the national ID is NOT found
// in the database, or when a validation error occurs.
type ValidateNationalIDErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"` // machine-readable error code (e.g. "NATIONAL_ID_NOT_FOUND", "INVALID_FORMAT")
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

// ValidateNationalID is the HTTP handler that checks whether a given
// national ID exists in the students database.
//
// This handler is intended to be called BEFORE the actual registration
// form submission. The flow is:
//
//  1. Frontend sends { "national_id": "30001011234567" } to this endpoint.
//  2. Backend searches the students table using a parameterized query.
//  3. If found → returns 200 with student data (registration can continue).
//  4. If not found → returns 404 with an error message (registration blocked).
//
// This ensures that only students whose national IDs are pre-registered in
// the system can complete the registration/uniform-order process.
func (h *RegistrationHandler) ValidateNationalID(w http.ResponseWriter, r *http.Request) {
	// ---- 1. Parse & validate request body ----
	var req validateNationalIDRequest
	if err := httpx.ReadJSON(r, &req); err != nil {
		httpx.WriteJSON(w, http.StatusBadRequest, ValidateNationalIDErrorResponse{
			Success: false,
			Message: "invalid request body: " + err.Error(),
			Code:    "INVALID_REQUEST",
		})
		return
	}

	req.NationalID = strings.TrimSpace(req.NationalID)

	// ---- 2. Basic format validation ----
	if len(req.NationalID) != 14 {
		httpx.WriteJSON(w, http.StatusBadRequest, ValidateNationalIDErrorResponse{
			Success: false,
			Message: "الرقم القومي يجب أن يتكون من 14 رقمًا",
			Code:    "INVALID_FORMAT",
		})
		return
	}

	// ---- 3. Call the store layer (uses Prepared Statement internally) ----
	result, err := h.store.ValidateNationalID(r.Context(), store.ValidateNationalIDInput{
		NationalID: req.NationalID,
	})
	if err != nil {
		// A real database/connection error
		httpx.WriteJSON(w, http.StatusInternalServerError, ValidateNationalIDErrorResponse{
			Success: false,
			Message: "حدث خطأ أثناء التحقق من الرقم القومي، يرجى المحاولة مرة أخرى",
			Code:    "SERVER_ERROR",
		})
		return
	}

	// ---- 4. Handle the result ----
	if !result.Exists {
		// The national ID was not found in the database
		httpx.WriteJSON(w, http.StatusNotFound, ValidateNationalIDErrorResponse{
			Success: false,
			Message: "الرقم القومي غير موجود في قاعدة البيانات، يرجى التأكد من صحة البيانات",
			Code:    "NATIONAL_ID_NOT_FOUND",
		})
		return
	}

	// ---- 5. Success — national ID found and matched ----
	httpx.WriteJSON(w, http.StatusOK, ValidateNationalIDSuccessResponse{
		Success:   true,
		Message:   "تم التحقق من الرقم القومي بنجاح",
		StudentID: result.StudentID,
		FullName:  result.FullName,
		GradeID:   result.GradeID,
		GradeName: result.GradeName,
		MajorCode: result.MajorCode,
		MajorName: result.MajorName,
	})
}