package models

import "time"

type Grade struct {
	ID        int64     `json:"id" db:"id"`
	NameAr    string    `json:"name_ar" db:"name_ar"`
	Level     int       `json:"level" db:"level"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type Major struct {
	ID        int64     `json:"id" db:"id"`
	Code      string    `json:"code" db:"code"`
	NameAr    string    `json:"name_ar" db:"name_ar"`
	NameEn    string    `json:"name_en" db:"name_en"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type Student struct {
	ID          int64     `json:"id" db:"id"`
	NationalID  string    `json:"national_id" db:"national_id"`
	FullName    string    `json:"full_name" db:"full_name"`
	Gender      string    `json:"gender" db:"gender"`
	GradeID     int64     `json:"grade_id" db:"grade_id"`
	GradeName   string    `json:"grade_name,omitempty" db:"grade_name"`
	MajorID     *int64    `json:"major_id,omitempty" db:"major_id"`
	MajorCode   *string   `json:"major_code,omitempty" db:"major_code"`
	MajorName   *string   `json:"major_name,omitempty" db:"major_name"`
	ParentPhone string    `json:"parent_phone" db:"parent_phone"`
	ClassName   *string   `json:"class_name,omitempty" db:"class_name"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type StudentAuth struct {
	Student
	PasswordHash string `json:"-" db:"password_hash"`
}

type Subject struct {
	ID        int64     `json:"id" db:"id"`
	Code      string    `json:"code" db:"code"`
	NameEn    string    `json:"name_en" db:"name_en"`
	NameAr    string    `json:"name_ar" db:"name_ar"`
	ColorHex  string    `json:"color_hex" db:"color_hex"`
	IconName  string    `json:"icon_name" db:"icon_name"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type MonthlyPerformance struct {
	ID             int64     `json:"id" db:"id"`
	StudentID      int64     `json:"student_id" db:"student_id"`
	MonthID        int64     `json:"month_id" db:"month_id"`
	MonthName      string    `json:"month_name" db:"month_name"`
	GeneralRate    float64   `json:"general_rate" db:"general_rate"`
	BehaviorRate   float64   `json:"behavior_rate" db:"behavior_rate"`
	AttendanceRate float64   `json:"attendance_rate" db:"attendance_rate"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

type StudentSubjectScore struct {
	ID                int64     `json:"id" db:"id"`
	StudentID         int64     `json:"student_id" db:"student_id"`
	SubjectID         int64     `json:"subject_id" db:"subject_id"`
	SubjectCode       string    `json:"subject_code" db:"subject_code"`
	SubjectNameEn     string    `json:"subject_name_en" db:"subject_name_en"`
	SubjectNameAr     string    `json:"subject_name_ar" db:"subject_name_ar"`
	ColorHex          string    `json:"color_hex" db:"color_hex"`
	IconName          string    `json:"icon_name" db:"icon_name"`
	MonthID           int64     `json:"month_id" db:"month_id"`
	MonthName         string    `json:"month_name" db:"month_name"`
	Score             float64   `json:"score" db:"score"`
	MaxScore          float64   `json:"max_score" db:"max_score"`
	Evaluation        string    `json:"evaluation" db:"evaluation"`
	ParticipationRate float64   `json:"participation_rate" db:"participation_rate"`
	HomeworkDone      int       `json:"homework_done" db:"homework_done"`
	HomeworkTotal     int       `json:"homework_total" db:"homework_total"`
	AttendanceRate    float64   `json:"attendance_rate" db:"attendance_rate"`
	LastExamScore     float64   `json:"last_exam_score" db:"last_exam_score"`
	LastExamMaxScore  float64   `json:"last_exam_max_score" db:"last_exam_max_score"`
	Recommendation    string    `json:"recommendation" db:"recommendation"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

type UniformProduct struct {
	ID          int64     `json:"id" db:"id"`
	NameAr      string    `json:"name_ar" db:"name_ar"`
	Description string    `json:"description" db:"description"`
	Price       float64   `json:"price" db:"price"`
	ColorHex    string    `json:"color_hex" db:"color_hex"`
	IconName    string    `json:"icon_name" db:"icon_name"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type UniformSize struct {
	ID        int64     `json:"id" db:"id"`
	Code      string    `json:"code" db:"code"`
	NameAr    string    `json:"name_ar" db:"name_ar"`
	SortOrder int       `json:"sort_order" db:"sort_order"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type UniformOrder struct {
	ID            int64     `json:"id" db:"id"`
	OrderNumber   string    `json:"order_number" db:"order_number"`
	StudentID     *int64    `json:"student_id,omitempty" db:"student_id"`
	StudentName   string    `json:"student_name" db:"student_name"`
	StudentGender string    `json:"student_gender" db:"student_gender"`
	GradeID       int64     `json:"grade_id" db:"grade_id"`
	GradeName     string    `json:"grade_name,omitempty" db:"grade_name"`
	ParentPhone   string    `json:"parent_phone" db:"parent_phone"`
	Status        string    `json:"status" db:"status"`
	TotalAmount   float64   `json:"total_amount" db:"total_amount"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

type UniformOrderItem struct {
	ID          int64     `json:"id" db:"id"`
	OrderID     int64     `json:"order_id" db:"order_id"`
	ProductID   int64     `json:"product_id" db:"product_id"`
	ProductName string    `json:"product_name,omitempty" db:"product_name"`
	SizeID      int64     `json:"size_id" db:"size_id"`
	SizeCode    string    `json:"size_code,omitempty" db:"size_code"`
	Quantity    int       `json:"quantity" db:"quantity"`
	UnitPrice   float64   `json:"unit_price" db:"unit_price"`
	TotalPrice  float64   `json:"total_price" db:"total_price"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
