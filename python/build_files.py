import os
# 2. create_excel.py - part 1
cel_part1 = r'''
\"\"\"create_excel.py
ينشئ ملف Excel (students_data.xlsx) يحتوي على بيانات الطلاب والدرجات
التي كانت مخزنة كـ \"بيانات مزيفة\" في الفرونت إند.
هذا الملف يمثل نظام المدرسة الذي يعتمد على Excel sheet وليس موقع الكتروني.
\"\"\"

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

EXCEL_FILE = "students_data.xlsx"


def style_header(ws, row, num_cols):
    header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF", size=12)
    thin_border = Border(
        left=Side(style="thin", color="000000"),
        right=Side(style="thin", color="000000"),
        top=Side(style="thin", color="000000"),
        bottom=Side(style="thin", color="000000"),
    )
    for col in range(1, num_cols + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border


def autofit_columns(ws):
    for col in ws.columns:
        max_length = 0
        column_letter = get_column_letter(col[0].column)
        for cell in col:
            try:
                if cell.value is not None and len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except Exception:
                pass
        adjusted_width = min(max_length + 2, 50)
        ws.column_dimensions[column_letter].width = adjusted_width


def create_students_sheet(wb):
    ws = wb.create_sheet("Students")
    headers = [
        "student_id", "national_id", "full_name", "gender",
        "grade_id", "grade_name", "major_id", "major_code",
        "major_name", "parent_phone", "class_name"
    ]
    ws.append(headers)
    style_header(ws, 1, len(headers))

    students = [
        (1, "12345678901234", "\u0623\u062d\u0645\u062f \u0639\u0644\u064a \u0645\u062d\u0645\u062f", "Male", 1, "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644", 1, "IT", "\u062a\u0643\u0646\u0648\u0644\u0648\u0632\u064a\u0627 \u0645\u0639\u0644\u0648\u0645\u0627\u062a", "01000000000", "A"),
        (2, "23456789012345", "\u0641\u0627\u0637\u0645\u0629 \u0623\u062d\u0645\u062f \u062d\u0633\u064a\u0646", "Female", 1, "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644", 2, "Communications", "\u0623\u062a\u0635\u0627\u0644", "01011111111", "B"),
        (3, "34567890123456", "\u0645\u062d\u0645\u062f \u0633\u0627\u0645\u064a \u0627\u062f\u0644\u0644\u0647", "Male", 2, "\u0627\u0644\u0635\u0641 \u0627\u0644\u062b\u0627\u0646\u064a", 1, "IT", "\u062a\u0643\u0646\u0648\u0644\u0648\u0632\u064a\u0627 \u0645\u0639\u0644\u0648\u0645\u0627\u062a", "01022222222", "A"),
        (4, "45678901234567", "\u0633\u0627\u0631\u0629 \u0645\u062d\u0645\u0648\u062f \u0633\u0627\u0644\u0645", "Female", 2, "\u0627\u0644\u0635\u0641 \u0627\u0644\u062b\u0627\u0646\u064a", 3, "Networking", "\u0627\u0644\u0634\u0628\u0643\u0627\u062a", "01033333333", "B"),
        (5, "56789012345678", "\u0639\u0644\u064a \u062d\u0633\u0646 \u0645\u062d\u0645\u062f", "Male", 3, "\u0627\u0644\u0635\u0641 \u0627\u0644\u062b\u0627\u0644\u062b", 2, "Communications", "\u0623\u062a\u0635\u0627\u0644", "01044444444", "C"),
    ]

    for student in students:
        ws.append(list(student))

    autofit_columns(ws)
    return ws
'''

with open(os.path.join(base, "create_excel.py"), "w", encoding="utf-8") as f:
    f.write(cel_part1)

print("create_excel.py part 1 done")

base = r"D:\Yousseif Elshenawy projects\capstone-project\python"

# 1. requirements.txt
with open(os.path.join(base, "requirements.txt"), "w", encoding="utf-8") as f:
    f.write("fastapi==0.115.0\nuvicorn==0.32.0\nopenpyxl==3.1.5\npython-multipart==0.0.9\n")

print("requirements.txt done")