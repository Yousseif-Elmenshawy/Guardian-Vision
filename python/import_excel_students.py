import argparse
import base64
import getpass
import hashlib
import os

from openpyxl import load_workbook

from database_sync import connect_database, excel_text
from sync_database_to_excel import export_database_to_excel

EXCEL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students_data.xlsx")
PASSWORD_ITERATIONS = 210000


def hash_password(password, pepper):
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        "sha256", (password + pepper).encode("utf-8"), salt, PASSWORD_ITERATIONS, 32
    )
    encode = lambda value: base64.b64encode(value).decode("ascii").rstrip("=")
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${encode(salt)}${encode(key)}"


def read_sheet_rows(worksheet):
    rows = worksheet.iter_rows(values_only=True)
    headers = [excel_text(value) for value in next(rows)]
    return [
        dict(zip(headers, row))
        for row in rows
        if any(value is not None for value in row)
    ]


def prepare_import(excel_file=EXCEL_FILE, dry_run=False):
    workbook = load_workbook(excel_file, data_only=True, read_only=True)
    students = read_sheet_rows(workbook["Students"])
    grades = read_sheet_rows(workbook["Grades"])
    performance = read_sheet_rows(workbook["MonthlyPerformance"])
    workbook.close()

    connection = connect_database()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, national_id FROM students")
            database_students = {
                str(row["national_id"]): row["id"] for row in cursor.fetchall()
            }
            pending_students = []
            student_id_map = {}
            excel_only_student_ids = set()
            for student in students:
                national_id = excel_text(student.get("national_id"))
                if len(national_id) != 14 or not national_id.isdigit():
                    raise ValueError(f"Invalid national_id in Excel: {national_id!r}")
                if national_id in database_students:
                    continue
                excel_only_student_ids.add(student["student_id"])
                pending_students.append(student)

            cursor.execute("SELECT id, code FROM majors")
            major_id_by_code = {
                excel_text(row["code"]).casefold(): row["id"]
                for row in cursor.fetchall()
            }
            cursor.execute("SELECT id FROM grades")
            grade_ids = {row["id"] for row in cursor.fetchall()}
            cursor.execute("SELECT id, code, name_ar FROM subjects")
            subjects = cursor.fetchall()
            subject_by_id = {row["id"]: row["id"] for row in subjects}
            subject_by_code = {
                excel_text(row["code"]).casefold(): row["id"] for row in subjects
            }
            subject_by_name = {
                excel_text(row["name_ar"]): row["id"] for row in subjects
            }
            cursor.execute("SELECT id FROM academic_months")
            month_ids = {row["id"] for row in cursor.fetchall()}

            for student in students:
                if student["student_id"] not in excel_only_student_ids:
                    continue
                grade_id = int(student["grade_id"])
                if grade_id not in grade_ids:
                    raise ValueError(f"Unknown grade_id in Excel: {grade_id}")
                major_code = excel_text(student.get("major_code")).casefold()
                if major_code and major_code not in major_id_by_code:
                    raise ValueError(
                        f"No database major matches Excel major_code {student.get('major_code')!r}"
                    )

            for row in grades:
                if row["student_id"] not in excel_only_student_ids:
                    continue
                subject_id = (
                    subject_by_name.get(excel_text(row.get("subject_name_ar")))
                    or subject_by_code.get(excel_text(row.get("subject_code")).casefold())
                    or subject_by_id.get(int(row["subject_id"]))
                )
                if subject_id is None:
                    raise ValueError(
                        f"No database subject matches {row.get('subject_name_ar')!r}"
                    )
                month_id = int(row["month_id"])
                if month_id not in month_ids:
                    raise ValueError(f"Unknown month_id in Excel: {month_id}")
            for row in performance:
                if (
                    row["student_id"] in excel_only_student_ids
                    and int(row["month_id"]) not in month_ids
                ):
                    raise ValueError(f"Unknown month_id in Excel: {row['month_id']}")

            if dry_run:
                print(f"Would import {len(pending_students)} Excel-only students.")
                connection.rollback()
                return len(pending_students)

            connection.commit()
            students_with_passwords = []
            for student in pending_students:
                national_id = excel_text(student["national_id"])
                password = getpass.getpass(
                    f"Set a password for {excel_text(student.get('full_name'))} "
                    f"({national_id}): "
                )
                confirmation = getpass.getpass("Confirm password: ")
                if (
                    len(password) < 6
                    or password != password.strip()
                    or password != confirmation
                ):
                    raise ValueError(
                        f"Password for {national_id} must match, have at least 6 characters, "
                        "and not start or end with whitespace."
                    )
                students_with_passwords.append(
                    (
                        student,
                        hash_password(password, os.environ.get("GV_PASSWORD_PEPPER", "")),
                    )
                )

            connection.begin()
            for student, password_hash in students_with_passwords:
                major_id = major_id_by_code.get(
                    excel_text(student.get("major_code")).casefold()
                )
                cursor.execute(
                    """
                    INSERT INTO students
                      (national_id, password_hash, full_name, gender, grade_id,
                       major_id, parent_phone, class_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        excel_text(student["national_id"]),
                        password_hash,
                        excel_text(student.get("full_name")),
                        excel_text(student.get("gender")).lower(),
                        int(student["grade_id"]),
                        major_id,
                        excel_text(student.get("parent_phone")),
                        excel_text(student.get("class_name")) or None,
                    ),
                )
                student_id_map[student["student_id"]] = cursor.lastrowid

            for row in performance:
                db_student_id = student_id_map.get(row["student_id"])
                if db_student_id is None:
                    continue
                month_id = int(row["month_id"])
                if month_id not in month_ids:
                    raise ValueError(f"Unknown month_id in Excel: {month_id}")
                cursor.execute(
                    """
                    INSERT INTO monthly_performance
                      (student_id, month_id, general_rate, behavior_rate, attendance_rate)
                    VALUES (%s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE id = id
                    """,
                    (
                        db_student_id,
                        month_id,
                        row["general_rate"],
                        row["behavior_rate"],
                        row["attendance_rate"],
                    ),
                )

            for row in grades:
                db_student_id = student_id_map.get(row["student_id"])
                if db_student_id is None:
                    continue
                subject_id = (
                    subject_by_name.get(excel_text(row.get("subject_name_ar")))
                    or subject_by_code.get(excel_text(row.get("subject_code")).casefold())
                    or subject_by_id.get(int(row["subject_id"]))
                )
                month_id = int(row["month_id"])
                cursor.execute(
                    """
                    INSERT INTO student_subject_scores
                      (student_id, subject_id, month_id, score, max_score, evaluation,
                       participation_rate, homework_done, homework_total, attendance_rate,
                       last_exam_score, last_exam_max_score, recommendation)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE id = id
                    """,
                    (
                        db_student_id,
                        subject_id,
                        month_id,
                        row["score"],
                        row["max_score"],
                        excel_text(row.get("evaluation")),
                        row.get("participation_rate") or 0,
                        row.get("homework_done") or 0,
                        row.get("homework_total") or 0,
                        row.get("attendance_rate") or 0,
                        row.get("last_exam_score") or 0,
                        row.get("last_exam_max_score") or 100,
                        excel_text(row.get("recommendation")),
                    ),
                )

        connection.commit()
        return len(pending_students)
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Import Excel-only students into MySQL with administrator-set passwords."
    )
    parser.add_argument("--dry-run", action="store_true", help="Check rows without changing the database.")
    args = parser.parse_args()
    try:
        imported = prepare_import(dry_run=args.dry_run)
    except Exception as error:
        raise SystemExit(f"Excel student import failed: {error}") from error
    if not args.dry_run:
        print(f"Imported {imported} Excel-only students and their scores.")
        try:
            table_count, report_count = export_database_to_excel()
        except Exception as error:
            raise SystemExit(
                f"Students were imported, but the Excel snapshot could not be refreshed: {error}"
            ) from error
        print(
            f"Refreshed {table_count} database sheets and {report_count} student reports."
        )
