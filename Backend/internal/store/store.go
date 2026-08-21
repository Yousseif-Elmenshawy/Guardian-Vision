package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"guardian-vision/backend/internal/models"
)

var ErrNotFound = errors.New("not found")

type Store struct {
	db *sql.DB
}

func New(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) Ping(ctx context.Context) error {
	return s.db.PingContext(ctx)
}

// ListAllStudents returns all students in the database — useful for debugging.
type StudentListItem struct {
	ID         int64   `json:"id"`
	NationalID string  `json:"national_id"`
	FullName   string  `json:"full_name"`
	Gender     string  `json:"gender"`
	GradeID    int64   `json:"grade_id"`
	GradeName  string  `json:"grade_name"`
	MajorCode  *string `json:"major_code,omitempty"`
	MajorName  *string `json:"major_name,omitempty"`
	MajorID    *int64  `json:"major_id,omitempty"`
}

func (s *Store) ListAllStudents(ctx context.Context) ([]StudentListItem, error) {
	const query = `
SELECT
	s.id, s.national_id, s.full_name, s.gender, s.grade_id,
	g.name_ar AS grade_name,
	s.major_id, m.code AS major_code, m.name_ar AS major_name
FROM students s
JOIN grades g ON g.id = s.grade_id
LEFT JOIN majors m ON m.id = s.major_id
ORDER BY s.id ASC`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []StudentListItem
	for rows.Next() {
		var item StudentListItem
		var majorID sql.NullInt64
		var majorCode, majorName sql.NullString
		if err := rows.Scan(
			&item.ID,
			&item.NationalID,
			&item.FullName,
			&item.Gender,
			&item.GradeID,
			&item.GradeName,
			&majorID,
			&majorCode,
			&majorName,
		); err != nil {
			return nil, err
		}
		if majorID.Valid {
			item.MajorID = &majorID.Int64
		}
		if majorCode.Valid {
			item.MajorCode = &majorCode.String
		}
		if majorName.Valid {
			item.MajorName = &majorName.String
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Store) GetStudentByNationalID(ctx context.Context, nationalID string) (*models.StudentAuth, error) {
	const query = `
SELECT
	s.id, s.national_id, s.password_hash, s.full_name, s.gender, s.grade_id,
	g.name_ar AS grade_name,
	s.major_id, m.code AS major_code, m.name_ar AS major_name,
	s.parent_phone, s.class_name, s.created_at, s.updated_at
FROM students s
JOIN grades g ON g.id = s.grade_id
LEFT JOIN majors m ON m.id = s.major_id
WHERE s.national_id = ?
LIMIT 1`

	row := s.db.QueryRowContext(ctx, query, nationalID)
	return scanStudentAuth(row)
}

func (s *Store) GetStudentByID(ctx context.Context, id int64) (*models.Student, error) {
	const query = `
SELECT
	s.id, s.national_id, s.full_name, s.gender, s.grade_id,
	g.name_ar AS grade_name,
	s.major_id, m.code AS major_code, m.name_ar AS major_name,
	s.parent_phone, s.class_name, s.created_at, s.updated_at
FROM students s
JOIN grades g ON g.id = s.grade_id
LEFT JOIN majors m ON m.id = s.major_id
WHERE s.id = ?
LIMIT 1`

	var student models.Student
	var majorID sql.NullInt64
	var majorCode, majorName, className sql.NullString
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&student.ID,
		&student.NationalID,
		&student.FullName,
		&student.Gender,
		&student.GradeID,
		&student.GradeName,
		&majorID,
		&majorCode,
		&majorName,
		&student.ParentPhone,
		&className,
		&student.CreatedAt,
		&student.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	applyNullableStudentFields(&student, majorID, majorCode, majorName, className)
	return &student, nil
}

func (s *Store) ListMonthlyPerformance(ctx context.Context, studentID int64) ([]models.MonthlyPerformance, error) {
	const query = `
SELECT
	mp.id, mp.student_id, mp.month_id, am.name_ar,
	mp.general_rate, mp.behavior_rate, mp.attendance_rate,
	mp.created_at, mp.updated_at
FROM monthly_performance mp
JOIN academic_months am ON am.id = mp.month_id
WHERE mp.student_id = ?
ORDER BY am.sort_order ASC`

	rows, err := s.db.QueryContext(ctx, query, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.MonthlyPerformance
	for rows.Next() {
		var item models.MonthlyPerformance
		if err := rows.Scan(
			&item.ID,
			&item.StudentID,
			&item.MonthID,
			&item.MonthName,
			&item.GeneralRate,
			&item.BehaviorRate,
			&item.AttendanceRate,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Store) ListStudentSubjects(ctx context.Context, studentID, monthID int64) ([]models.StudentSubjectScore, error) {
	if monthID == 0 {
		latest, err := s.latestScoreMonth(ctx, studentID)
		if err != nil {
			return nil, err
		}
		monthID = latest
	}

	const query = `
SELECT
	sss.id, sss.student_id, sss.subject_id,
	sub.code, sub.name_en, sub.name_ar, sub.color_hex, sub.icon_name,
	sss.month_id, am.name_ar,
	sss.score, sss.max_score, sss.evaluation,
	sss.participation_rate, sss.homework_done, sss.homework_total,
	sss.attendance_rate, sss.last_exam_score, sss.last_exam_max_score,
	sss.recommendation, sss.created_at, sss.updated_at
FROM student_subject_scores sss
JOIN subjects sub ON sub.id = sss.subject_id
JOIN academic_months am ON am.id = sss.month_id
WHERE sss.student_id = ? AND sss.month_id = ?
ORDER BY sub.id ASC`

	rows, err := s.db.QueryContext(ctx, query, studentID, monthID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.StudentSubjectScore
	for rows.Next() {
		item, err := scanSubjectScore(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Store) GetStudentSubjectDetail(ctx context.Context, studentID, subjectID int64) (*models.StudentSubjectScore, error) {
	monthID, err := s.latestScoreMonth(ctx, studentID)
	if err != nil {
		return nil, err
	}

	const query = `
SELECT
	sss.id, sss.student_id, sss.subject_id,
	sub.code, sub.name_en, sub.name_ar, sub.color_hex, sub.icon_name,
	sss.month_id, am.name_ar,
	sss.score, sss.max_score, sss.evaluation,
	sss.participation_rate, sss.homework_done, sss.homework_total,
	sss.attendance_rate, sss.last_exam_score, sss.last_exam_max_score,
	sss.recommendation, sss.created_at, sss.updated_at
FROM student_subject_scores sss
JOIN subjects sub ON sub.id = sss.subject_id
JOIN academic_months am ON am.id = sss.month_id
WHERE sss.student_id = ? AND sss.subject_id = ? AND sss.month_id = ?
LIMIT 1`

	row := s.db.QueryRowContext(ctx, query, studentID, subjectID, monthID)
	item, err := scanSubjectScore(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &item, nil
}

func (s *Store) ListGrades(ctx context.Context) ([]models.Grade, error) {
	const query = `SELECT id, name_ar, level, created_at, updated_at FROM grades ORDER BY level ASC`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grades []models.Grade
	for rows.Next() {
		var grade models.Grade
		if err := rows.Scan(&grade.ID, &grade.NameAr, &grade.Level, &grade.CreatedAt, &grade.UpdatedAt); err != nil {
			return nil, err
		}
		grades = append(grades, grade)
	}
	return grades, rows.Err()
}

func (s *Store) ListMajors(ctx context.Context) ([]models.Major, error) {
	const query = `SELECT id, code, name_ar, name_en, created_at, updated_at FROM majors ORDER BY id ASC`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var majors []models.Major
	for rows.Next() {
		var major models.Major
		if err := rows.Scan(&major.ID, &major.Code, &major.NameAr, &major.NameEn, &major.CreatedAt, &major.UpdatedAt); err != nil {
			return nil, err
		}
		majors = append(majors, major)
	}
	return majors, rows.Err()
}

func (s *Store) ListUniformProducts(ctx context.Context) ([]models.UniformProduct, error) {
	const query = `
SELECT id, name_ar, description, price, color_hex, icon_name, is_active, created_at, updated_at
FROM uniform_products
WHERE is_active = TRUE
ORDER BY id ASC`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.UniformProduct
	for rows.Next() {
		var product models.UniformProduct
		if err := rows.Scan(
			&product.ID,
			&product.NameAr,
			&product.Description,
			&product.Price,
			&product.ColorHex,
			&product.IconName,
			&product.IsActive,
			&product.CreatedAt,
			&product.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}
	return products, rows.Err()
}

func (s *Store) ListUniformSizes(ctx context.Context) ([]models.UniformSize, error) {
	const query = `SELECT id, code, name_ar, sort_order, created_at, updated_at FROM uniform_sizes ORDER BY sort_order ASC`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sizes []models.UniformSize
	for rows.Next() {
		var size models.UniformSize
		if err := rows.Scan(&size.ID, &size.Code, &size.NameAr, &size.SortOrder, &size.CreatedAt, &size.UpdatedAt); err != nil {
			return nil, err
		}
		sizes = append(sizes, size)
	}
	return sizes, rows.Err()
}

type CreateUniformOrderInput struct {
	StudentID     *int64
	StudentName   string
	StudentGender string
	GradeID       int64
	ParentPhone   string
	Items         []CreateUniformOrderItemInput
}

type CreateUniformOrderItemInput struct {
	ProductID int64
	SizeID    int64
	Quantity  int
}

func (s *Store) CreateUniformOrder(ctx context.Context, input CreateUniformOrderInput) (*models.UniformOrder, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	orderNumber := fmt.Sprintf("GV-%d", time.Now().UnixNano())
	var totalAmount float64

	productPrices := make(map[int64]float64)
	for _, item := range input.Items {
		if item.Quantity <= 0 {
			return nil, errors.New("quantity must be greater than zero")
		}

		price, ok := productPrices[item.ProductID]
		if !ok {
			err := tx.QueryRowContext(ctx, `SELECT price FROM uniform_products WHERE id = ? AND is_active = TRUE`, item.ProductID).Scan(&price)
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					return nil, ErrNotFound
				}
				return nil, err
			}
			productPrices[item.ProductID] = price
		}
		totalAmount += price * float64(item.Quantity)
	}

	result, err := tx.ExecContext(ctx, `
INSERT INTO uniform_orders (order_number, student_id, student_name, student_gender, grade_id, parent_phone, status, total_amount)
VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
		orderNumber,
		input.StudentID,
		input.StudentName,
		input.StudentGender,
		input.GradeID,
		input.ParentPhone,
		totalAmount,
	)
	if err != nil {
		return nil, err
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	for _, item := range input.Items {
		unitPrice := productPrices[item.ProductID]
		if _, err := tx.ExecContext(ctx, `
INSERT INTO uniform_order_items (order_id, product_id, size_id, quantity, unit_price, total_price)
VALUES (?, ?, ?, ?, ?, ?)`,
			orderID,
			item.ProductID,
			item.SizeID,
			item.Quantity,
			unitPrice,
			unitPrice*float64(item.Quantity),
		); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return s.GetUniformOrderByID(ctx, orderID)
}

func (s *Store) GetUniformOrderByID(ctx context.Context, orderID int64) (*models.UniformOrder, error) {
	const query = `
SELECT uo.id, uo.order_number, uo.student_id, uo.student_name, uo.student_gender,
	uo.grade_id, g.name_ar, uo.parent_phone, uo.status, uo.total_amount,
	uo.created_at, uo.updated_at
FROM uniform_orders uo
JOIN grades g ON g.id = uo.grade_id
WHERE uo.id = ?
LIMIT 1`

	var order models.UniformOrder
	var studentID sql.NullInt64
	err := s.db.QueryRowContext(ctx, query, orderID).Scan(
		&order.ID,
		&order.OrderNumber,
		&studentID,
		&order.StudentName,
		&order.StudentGender,
		&order.GradeID,
		&order.GradeName,
		&order.ParentPhone,
		&order.Status,
		&order.TotalAmount,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if studentID.Valid {
		order.StudentID = &studentID.Int64
	}
	return &order, nil
}

func (s *Store) ListUniformOrdersByStudent(ctx context.Context, studentID int64) ([]models.UniformOrder, error) {
	const query = `
SELECT uo.id, uo.order_number, uo.student_id, uo.student_name, uo.student_gender,
	uo.grade_id, g.name_ar, uo.parent_phone, uo.status, uo.total_amount,
	uo.created_at, uo.updated_at
FROM uniform_orders uo
JOIN grades g ON g.id = uo.grade_id
WHERE uo.student_id = ?
ORDER BY uo.created_at DESC`

	rows, err := s.db.QueryContext(ctx, query, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.UniformOrder
	for rows.Next() {
		var order models.UniformOrder
		var nullableStudentID sql.NullInt64
		if err := rows.Scan(
			&order.ID,
			&order.OrderNumber,
			&nullableStudentID,
			&order.StudentName,
			&order.StudentGender,
			&order.GradeID,
			&order.GradeName,
			&order.ParentPhone,
			&order.Status,
			&order.TotalAmount,
			&order.CreatedAt,
			&order.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if nullableStudentID.Valid {
			order.StudentID = &nullableStudentID.Int64
		}
		orders = append(orders, order)
	}
	return orders, rows.Err()
}

func (s *Store) latestScoreMonth(ctx context.Context, studentID int64) (int64, error) {
	var monthID int64
	err := s.db.QueryRowContext(ctx, `SELECT COALESCE(MAX(month_id), 0) FROM student_subject_scores WHERE student_id = ?`, studentID).Scan(&monthID)
	if err != nil {
		return 0, err
	}
	if monthID == 0 {
		return 0, ErrNotFound
	}
	return monthID, nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanStudentAuth(row scanner) (*models.StudentAuth, error) {
	var student models.StudentAuth
	var majorID sql.NullInt64
	var majorCode, majorName, className sql.NullString
	err := row.Scan(
		&student.ID,
		&student.NationalID,
		&student.PasswordHash,
		&student.FullName,
		&student.Gender,
		&student.GradeID,
		&student.GradeName,
		&majorID,
		&majorCode,
		&majorName,
		&student.ParentPhone,
		&className,
		&student.CreatedAt,
		&student.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	applyNullableStudentFields(&student.Student, majorID, majorCode, majorName, className)
	return &student, nil
}

func applyNullableStudentFields(student *models.Student, majorID sql.NullInt64, majorCode, majorName, className sql.NullString) {
	if majorID.Valid {
		student.MajorID = &majorID.Int64
	}
	if majorCode.Valid {
		student.MajorCode = &majorCode.String
	}
	if majorName.Valid {
		student.MajorName = &majorName.String
	}
	if className.Valid {
		student.ClassName = &className.String
	}
}

func scanSubjectScore(row scanner) (models.StudentSubjectScore, error) {
	var item models.StudentSubjectScore
	err := row.Scan(
		&item.ID,
		&item.StudentID,
		&item.SubjectID,
		&item.SubjectCode,
		&item.SubjectNameEn,
		&item.SubjectNameAr,
		&item.ColorHex,
		&item.IconName,
		&item.MonthID,
		&item.MonthName,
		&item.Score,
		&item.MaxScore,
		&item.Evaluation,
		&item.ParticipationRate,
		&item.HomeworkDone,
		&item.HomeworkTotal,
		&item.AttendanceRate,
		&item.LastExamScore,
		&item.LastExamMaxScore,
		&item.Recommendation,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	return item, err
}
