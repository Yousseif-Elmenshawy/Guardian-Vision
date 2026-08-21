package handlers

import (
	"net/http"
	"strings"

	"guardian-vision/backend/internal/httpx"
	"guardian-vision/backend/internal/middleware"
	"guardian-vision/backend/internal/store"
)

type UniformHandler struct {
	store *store.Store
}

type createUniformOrderRequest struct {
	StudentName   string                          `json:"student_name"`
	StudentGender string                          `json:"student_gender"`
	GradeID       int64                           `json:"grade_id"`
	ParentPhone   string                          `json:"parent_phone"`
	Items         []createUniformOrderItemRequest `json:"items"`
}

type createUniformOrderItemRequest struct {
	ProductID int64 `json:"product_id"`
	SizeID    int64 `json:"size_id"`
	Quantity  int   `json:"quantity"`
}

func (h *UniformHandler) Products(w http.ResponseWriter, r *http.Request) {
	products, err := h.store.ListUniformProducts(r.Context())
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, products)
}

func (h *UniformHandler) Sizes(w http.ResponseWriter, r *http.Request) {
	sizes, err := h.store.ListUniformSizes(r.Context())
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, sizes)
}

func (h *UniformHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var req createUniformOrderRequest
	if err := httpx.ReadJSON(r, &req); err != nil {
		httpx.BadRequest(w, err)
		return
	}

	req.StudentName = strings.TrimSpace(req.StudentName)
	req.StudentGender = strings.TrimSpace(req.StudentGender)
	req.ParentPhone = strings.TrimSpace(req.ParentPhone)
	if req.StudentName == "" || req.StudentGender == "" || req.GradeID == 0 || req.ParentPhone == "" || len(req.Items) == 0 {
		httpx.WriteError(w, http.StatusBadRequest, "student_name, student_gender, grade_id, parent_phone and items are required")
		return
	}

	var studentID *int64
	if authenticatedID, ok := middleware.StudentIDFromContext(r.Context()); ok {
		studentID = &authenticatedID
	}

	items := make([]store.CreateUniformOrderItemInput, 0, len(req.Items))
	for _, item := range req.Items {
		items = append(items, store.CreateUniformOrderItemInput{
			ProductID: item.ProductID,
			SizeID:    item.SizeID,
			Quantity:  item.Quantity,
		})
	}

	order, err := h.store.CreateUniformOrder(r.Context(), store.CreateUniformOrderInput{
		StudentID:     studentID,
		StudentName:   req.StudentName,
		StudentGender: req.StudentGender,
		GradeID:       req.GradeID,
		ParentPhone:   req.ParentPhone,
		Items:         items,
	})
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusCreated, order)
}

func (h *UniformHandler) MyOrders(w http.ResponseWriter, r *http.Request) {
	studentID, ok := middleware.StudentIDFromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "missing authenticated student")
		return
	}

	orders, err := h.store.ListUniformOrdersByStudent(r.Context(), studentID)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteJSON(w, http.StatusOK, orders)
}
