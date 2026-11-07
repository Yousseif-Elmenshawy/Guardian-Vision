import unittest
from unittest.mock import patch

from database_sync import parse_mysql_dsn
from import_excel_students import hash_password
from sync_database_to_excel import quote_identifier, report_for_database, safe_excel_value


class FakeCursor:
    def __init__(self, results):
        self.results = iter(results)

    def execute(self, _query):
        return None

    def fetchall(self):
        return next(self.results)


class DatabaseSyncTests(unittest.TestCase):
    def test_parse_mysql_dsn(self):
        with patch("database_sync.pymysql.cursors.DictCursor", "dict-cursor"):
            config = parse_mysql_dsn(
                "school_user:secret@tcp(db.example:3307)/guardian_vision?parseTime=true"
            )
        self.assertEqual(config["host"], "db.example")
        self.assertEqual(config["port"], 3307)
        self.assertEqual(config["user"], "school_user")
        self.assertEqual(config["password"], "secret")
        self.assertEqual(config["database"], "guardian_vision")

    def test_reject_invalid_mysql_dsn(self):
        with self.assertRaises(ValueError):
            parse_mysql_dsn("not-a-mysql-dsn")

    def test_quote_identifier_rejects_sql(self):
        self.assertEqual(quote_identifier("student_scores"), "`student_scores`")
        with self.assertRaises(ValueError):
            quote_identifier("students; DROP TABLE students")

    def test_excel_text_cannot_inject_formulas(self):
        self.assertEqual(safe_excel_value("=1+1"), "'=1+1")
        self.assertEqual(safe_excel_value("Student"), "Student")
        self.assertEqual(safe_excel_value(85), 85)

    def test_hash_password_uses_go_compatible_format(self):
        first = hash_password("student-password", "")
        second = hash_password("student-password", "")
        self.assertTrue(first.startswith("pbkdf2_sha256$210000$"))
        self.assertNotEqual(first, second)
        parts = first.split("$")
        self.assertEqual(len(parts), 4)
        self.assertEqual(len(parts[2]), 22)
        self.assertEqual(len(parts[3]), 43)

    def test_report_contains_latest_student_grades_and_performance(self):
        cursor = FakeCursor(
            [
                [{
                    "id": 8, "national_id": "12345678901234", "full_name": "Student",
                    "gender": "male", "grade_id": 1, "grade_name": "الصف الأول",
                    "class_name": "A",
                }],
                [{
                    "student_id": 8, "month_id": 3, "month_name": "مارس",
                    "sort_order": 3, "general_rate": 82, "behavior_rate": 80,
                    "attendance_rate": 95,
                }],
                [{
                    "student_id": 8, "score": 80, "max_score": 100,
                    "recommendation": "مراجعة", "subject_name": "رياضيات",
                    "month_name": "مارس", "sort_order": 3,
                }, {
                    "student_id": 8, "score": 90, "max_score": 100,
                    "recommendation": "استمرار", "subject_name": "علوم",
                    "month_name": "مارس", "sort_order": 3,
                }],
            ]
        )
        report = report_for_database(cursor)[0]
        self.assertEqual(report["average_score"], 85)
        self.assertEqual(report["month_name"], "مارس")
        self.assertEqual(report["subject_count"], 2)
        self.assertIn("رياضيات", report["report"])


if __name__ == "__main__":
    unittest.main()
