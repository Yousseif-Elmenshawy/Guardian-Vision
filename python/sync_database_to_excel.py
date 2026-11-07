import os
import re
import tempfile
from datetime import datetime

from openpyxl import load_workbook
from openpyxl.styles import Alignment, Font, PatternFill

from database_sync import connect_database

EXCEL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students_data.xlsx")
SENSITIVE_COLUMNS = {
    "password",
    "password_hash",
    "token",
    "access_token",
    "refresh_token",
    "secret",
    "api_key",
}


def quote_identifier(value):
    if not re.fullmatch(r"[A-Za-z0-9_]+", value):
        raise ValueError(f"Unexpected database identifier: {value}")
    return f"`{value}`"


def safe_excel_value(value):
    if isinstance(value, str) and value.startswith(("=", "+", "-", "@")):
        return "'" + value
    return value


def report_for_database(cursor):
    cursor.execute(
        """
        SELECT s.id, s.national_id, s.full_name, s.gender, s.grade_id,
               g.name_ar AS grade_name, s.class_name
        FROM students s
        JOIN grades g ON g.id = s.grade_id
        ORDER BY s.id
        """
    )
    students = cursor.fetchall()
    cursor.execute(
        """
        SELECT student_id, month_id, name_ar AS month_name, sort_order,
               general_rate, behavior_rate, attendance_rate
        FROM monthly_performance
        JOIN academic_months ON academic_months.id = monthly_performance.month_id
        ORDER BY student_id, sort_order
        """
    )
    performance = cursor.fetchall()
    cursor.execute(
        """
        SELECT sss.student_id, sss.score, sss.max_score, sss.recommendation,
               sub.name_ar AS subject_name, am.name_ar AS month_name,
               am.sort_order
        FROM student_subject_scores sss
        JOIN subjects sub ON sub.id = sss.subject_id
        JOIN academic_months am ON am.id = sss.month_id
        ORDER BY sss.student_id, am.sort_order, sub.id
        """
    )
    scores = cursor.fetchall()

    performance_by_student = {}
    for row in performance:
        performance_by_student.setdefault(row["student_id"], []).append(row)
    scores_by_student = {}
    for row in scores:
        scores_by_student.setdefault(row["student_id"], []).append(row)

    reports = []
    for student in students:
        student_performance = performance_by_student.get(student["id"], [])
        latest_performance = student_performance[-1] if student_performance else None
        student_scores = scores_by_student.get(student["id"], [])
        latest_score_month = max(
            (row["sort_order"] for row in student_scores), default=None
        )
        latest_scores = [
            row for row in student_scores if row["sort_order"] == latest_score_month
        ]
        valid_scores = [
            row for row in latest_scores if float(row["max_score"]) > 0
        ]
        average = (
            sum(float(row["score"]) / float(row["max_score"]) * 100
                for row in valid_scores)
            / len(valid_scores)
            if valid_scores
            else None
        )
        lowest = min(
            latest_scores,
            key=lambda row: (
                float(row["score"]) / float(row["max_score"])
                if float(row["max_score"]) > 0
                else 0
            ),
            default=None,
        )
        if average is None:
            narrative = "لا توجد درجات مسجلة لهذا الطالب حتى الآن."
        else:
            narrative = f"متوسط درجات الطالب {average:.1f}%."
            if lowest:
                narrative += (
                    f" مادة تحتاج إلى متابعة: {lowest['subject_name']}."
                    f" {lowest['recommendation']}"
                )
        reports.append(
            {
                "student_id": student["id"],
                "national_id": student["national_id"],
                "full_name": student["full_name"],
                "grade_name": student["grade_name"],
                "class_name": student["class_name"],
                "month_name": (
                    latest_performance["month_name"]
                    if latest_performance
                    else (latest_scores[0]["month_name"] if latest_scores else None)
                ),
                "subject_count": len(latest_scores),
                "average_score": round(average, 2) if average is not None else None,
                "general_rate": (
                    latest_performance["general_rate"] if latest_performance else None
                ),
                "behavior_rate": (
                    latest_performance["behavior_rate"] if latest_performance else None
                ),
                "attendance_rate": (
                    latest_performance["attendance_rate"] if latest_performance else None
                ),
                "report": narrative,
            }
        )
    return reports


def write_rows(workbook, sheet_name, headers, rows):
    worksheet = workbook.create_sheet(sheet_name)
    worksheet.append(headers)
    for row in rows:
        worksheet.append([safe_excel_value(row.get(header)) for header in headers])
    worksheet.freeze_panes = "A2"
    worksheet.auto_filter.ref = worksheet.dimensions
    worksheet.row_dimensions[1].height = 30
    for cell in worksheet[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="1F4E78")
        cell.alignment = Alignment(horizontal="center", vertical="center")
    for column in worksheet.columns:
        width = min(max(max(len(str(cell.value or "")) for cell in column) + 2, 12), 60)
        worksheet.column_dimensions[column[0].column_letter].width = width
    return worksheet


def export_database_to_excel(excel_file=EXCEL_FILE):
    connection = connect_database()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")
            tables = [next(iter(row.values())) for row in cursor.fetchall()]
            table_data = []
            for table in tables:
                quoted_table = quote_identifier(table)
                cursor.execute(f"SHOW COLUMNS FROM {quoted_table}")
                columns = [
                    row["Field"]
                    for row in cursor.fetchall()
                    if row["Field"].lower() not in SENSITIVE_COLUMNS
                ]
                cursor.execute(
                    f"SELECT {', '.join(quote_identifier(col) for col in columns)} "
                    f"FROM {quoted_table}"
                )
                table_data.append((table, columns, cursor.fetchall()))
            report_rows = report_for_database(cursor)
    finally:
        connection.close()

    workbook = load_workbook(excel_file)
    for sheet_name in list(workbook.sheetnames):
        if sheet_name.startswith("DB_") or sheet_name == "Report":
            del workbook[sheet_name]
    for table, columns, rows in table_data:
        write_rows(workbook, f"DB_{table}"[:31], columns, rows)

    report_headers = list(report_rows[0]) if report_rows else [
        "student_id", "national_id", "full_name", "grade_name", "class_name",
        "month_name", "subject_count", "average_score", "general_rate",
        "behavior_rate", "attendance_rate", "report",
    ]
    write_rows(workbook, "Report", report_headers, report_rows)

    directory = os.path.dirname(os.path.abspath(excel_file))
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            suffix=".xlsx", prefix="students_data_", dir=directory, delete=False
        ) as temporary_file:
            temporary_path = temporary_file.name
        workbook.save(temporary_path)
        os.replace(temporary_path, excel_file)
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.remove(temporary_path)
    return len(tables), len(report_rows)


if __name__ == "__main__":
    try:
        table_count, report_count = export_database_to_excel()
    except Exception as error:
        raise SystemExit(f"Database-to-Excel export failed: {error}") from error
    print(
        f"Exported {table_count} database tables and {report_count} student reports "
        f"to {EXCEL_FILE} at {datetime.now().isoformat(timespec='seconds')}."
    )
    print("Password hashes are excluded from the workbook.")
