package store

import (
	"context"
	"database/sql"
	"errors"
)

// ValidateNationalIDInput holds the data needed to validate a national ID
// during the registration or form submission process.
type ValidateNationalIDInput struct {
	NationalID string `json:"national_id"`
}

// ValidateNationalIDResult contains the response returned after
// checking whether the national ID exists in the database.
type ValidateNationalIDResult struct {
	Exists     bool   `json:"exists"`
	StudentID  int64  `json:"student_id,omitempty"`
	FullName   string `json:"full_name,omitempty"`
	GradeID    int64  `json:"grade_id,omitempty"`
	GradeName  string `json:"grade_name,omitempty"`
	MajorCode  string `json:"major_code,omitempty"`
	MajorName  string `json:"major_name,omitempty"`
}

// ValidateNationalID queries the database to check if the given national_id
// exists in the students table. It uses a parameterized query (Prepared Statement)
// to prevent SQL injection.
//
// Why this is safe:
//   - The '?' placeholder in the SQL query is replaced by the database driver
//     with a properly escaped parameter — never by string concatenation.
//   - Even if nationalID contains malicious SQL fragments, they will be treated
//     as literal data, not executable code.
//   - The query uses LIMIT 1 for efficiency; we only need to confirm existence.
func (s *Store) ValidateNationalID(ctx context.Context, input ValidateNationalIDInput) (*ValidateNationalIDResult, error) {
	const query = `
SELECT
	s.id,
	s.full_name,
	s.grade_id,
	g.name_ar AS grade_name,
	COALESCE(m.code, '') AS major_code,
	COALESCE(m.name_ar, '') AS major_name
FROM students s
JOIN grades g ON g.id = s.grade_id
LEFT JOIN majors m ON m.id = s.major_id
WHERE s.national_id = ?
LIMIT 1`

	// row will scan into local variables
	var result ValidateNationalIDResult
	var majorCode, majorName sql.NullString

	err := s.db.QueryRowContext(ctx, query, input.NationalID).Scan(
		&result.StudentID,
		&result.FullName,
		&result.GradeID,
		&result.GradeName,
		&majorCode,
		&majorName,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// National ID not found — return exists=false without error
			return &ValidateNationalIDResult{Exists: false}, nil
		}
		// A real database error occurred
		return nil, err
	}

	// National ID found — populate optional fields and mark as exists
	result.Exists = true
	if majorCode.Valid {
		result.MajorCode = majorCode.String
	}
	if majorName.Valid {
		result.MajorName = majorName.String
	}

	return &result, nil
}