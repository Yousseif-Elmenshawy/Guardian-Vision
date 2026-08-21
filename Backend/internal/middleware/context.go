package middleware

import "context"

type contextKey string

const StudentIDKey contextKey = "student_id"

func WithStudentID(ctx context.Context, studentID int64) context.Context {
	return context.WithValue(ctx, StudentIDKey, studentID)
}

func StudentIDFromContext(ctx context.Context) (int64, bool) {
	studentID, ok := ctx.Value(StudentIDKey).(int64)
	return studentID, ok
}
