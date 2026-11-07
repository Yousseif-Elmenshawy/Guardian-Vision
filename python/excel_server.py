"""excel_server.py - Part 1: imports and app setup"""
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import openpyxl

EXCEL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students_data.xlsx")

app = FastAPI(title="Guardian Vision Excel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_workbook():
    if not os.path.exists(EXCEL_FILE):
        raise HTTPException(status_code=500, detail="ملف Excel غير موجود")
    return openpyxl.load_workbook(EXCEL_FILE, data_only=True)


def sheet_to_dicts(ws) -> List[Dict[str, Any]]:
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    headers = [str(h) for h in rows[0]]
    result = []
    for row in rows[1:]:
        if all(cell is None for cell in row):
            continue
        row_dict = {}
        for i, header in enumerate(headers):
            row_dict[header] = row[i] if i < len(row) else None
        result.append(row_dict)
    return result

@app.get("/api/excel/health")
async def health():
    return {"status": "ok", "message": "Excel API شغال", "excel_file": EXCEL_FILE}


@app.get("/api/excel/students")
async def get_all_students():
    wb = load_workbook()
    ws = wb["Students"]
    return sheet_to_dicts(ws)


@app.get("/api/excel/student/{national_id}")
async def get_student_by_national_id(national_id: str):
    wb = load_workbook()
    ws = wb["Students"]
    students = sheet_to_dicts(ws)
    for s in students:
        if str(s.get("national_id")) == national_id:
            return s
    raise HTTPException(status_code=404, detail="الطالب غير موجود")


@app.get("/api/excel/students/me")
async def get_current_student(national_id: Optional[str] = Query(default="12345678901234")):
    wb = load_workbook()
    ws = wb["Students"]
    students = sheet_to_dicts(ws)
    for s in students:
        if str(s.get("national_id")) == national_id:
            return {
                "id": s.get("student_id"),
                "national_id": s.get("national_id"),
                "full_name": s.get("full_name"),
                "gender": s.get("gender"),
                "grade_id": s.get("grade_id"),
                "grade_name": s.get("grade_name"),
                "major_id": s.get("major_id"),
                "major_code": s.get("major_code"),
                "major_name": s.get("major_name"),
                "parent_phone": s.get("parent_phone"),
                "class_name": s.get("class_name"),
            }
    raise HTTPException(status_code=404, detail="الطالب غير موجود")


@app.get("/api/excel/students/me/performance")
async def get_student_performance(
    student_id: Optional[int] = Query(default=1),
    month_id: Optional[int] = Query(default=None),
):
    wb = load_workbook()
    ws = wb["MonthlyPerformance"]
    data = sheet_to_dicts(ws)
    result = []
    for item in data:
        if int(item.get("student_id", 0)) != student_id:
            continue
        if month_id is not None and int(item.get("month_id", 0)) != month_id:
            continue
        result.append({
            "id": item.get("month_id"),
            "month_id": item.get("month_id"),
            "month_name": item.get("month_name"),
            "general_rate": float(item.get("general_rate", 0)),
            "behavior_rate": float(item.get("behavior_rate", 0)),
            "attendance_rate": float(item.get("attendance_rate", 0)),
        })
    return result


@app.get("/api/excel/students/me/subjects")
async def get_student_subjects(
    student_id: Optional[int] = Query(default=1),
    month_id: Optional[int] = Query(default=1),
):
    wb = load_workbook()
    ws = wb["Grades"]
    data = sheet_to_dicts(ws)
    result = []
    for item in data:
        if int(item.get("student_id", 0)) != student_id:
            continue
        if month_id is not None and int(item.get("month_id", 0)) != month_id:
            continue
        score = float(item.get("score", 0))
        max_score = float(item.get("max_score", 100))
        progress = round((score / max_score) * 100) if max_score > 0 else 0
        result.append({
            "id": item.get("subject_id"),
            "subject_id": item.get("subject_id"),
            "subject_code": item.get("subject_code"),
            "subject_name_en": item.get("subject_name_en"),
            "subject_name_ar": item.get("subject_name_ar"),
            "color_hex": item.get("color_hex"),
            "icon_name": item.get("icon_name"),
            "month_id": item.get("month_id"),
            "month_name": item.get("month_name"),
            "score": score,
            "max_score": max_score,
            "progress": progress,
            "evaluation": item.get("evaluation"),
            "participation_rate": float(item.get("participation_rate", 0)),
            "homework_done": int(item.get("homework_done", 0)),
            "homework_total": int(item.get("homework_total", 0)),
            "attendance_rate": float(item.get("attendance_rate", 0)),
            "last_exam_score": float(item.get("last_exam_score", 0)),
            "last_exam_max_score": float(item.get("last_exam_max_score", 0)),
            "recommendation": item.get("recommendation"),
        })
    return result


@app.get("/api/excel/students/me/subjects/{subject_id}")
async def get_student_subject_detail(subject_id: int, student_id: Optional[int] = Query(default=1)):
    wb = load_workbook()
    ws = wb["Grades"]
    data = sheet_to_dicts(ws)
    for item in data:
        if int(item.get("subject_id", 0)) == subject_id and int(item.get("student_id", 0)) == student_id:
            score = float(item.get("score", 0))
            max_score = float(item.get("max_score", 100))
            progress = round((score / max_score) * 100) if max_score > 0 else 0
            return {
                "id": item.get("subject_id"),
                "subject_id": item.get("subject_id"),
                "subject_code": item.get("subject_code"),
                "subject_name_en": item.get("subject_name_en"),
                "subject_name_ar": item.get("subject_name_ar"),
                "color_hex": item.get("color_hex"),
                "icon_name": item.get("icon_name"),
                "month_id": item.get("month_id"),
                "month_name": item.get("month_name"),
                "score": score,
                "max_score": max_score,
                "progress": progress,
                "evaluation": item.get("evaluation"),
                "participation_rate": float(item.get("participation_rate", 0)),
                "homework_done": int(item.get("homework_done", 0)),
                "homework_total": int(item.get("homework_total", 0)),
                "attendance_rate": float(item.get("attendance_rate", 0)),
                "last_exam_score": float(item.get("last_exam_score", 0)),
                "last_exam_max_score": float(item.get("last_exam_max_score", 0)),
                "recommendation": item.get("recommendation"),
            }
    raise HTTPException(status_code=404, detail="المادة غير موجودة لهذا الطالب")


@app.get("/api/excel/grades")
async def get_all_grades(student_id: Optional[int] = Query(default=1)):
    wb = load_workbook()
    ws = wb["Grades"]
    data = sheet_to_dicts(ws)
    result = []
    for item in data:
        if student_id is not None and int(item.get("student_id", 0)) != student_id:
            continue
        score = float(item.get("score", 0))
        max_score = float(item.get("max_score", 100))
        progress = round((score / max_score) * 100) if max_score > 0 else 0
        result.append({
            "id": item.get("subject_id"),
            "subject_name_en": item.get("subject_name_en"),
            "subject_name_ar": item.get("subject_name_ar"),
            "score": score,
            "max_score": max_score,
            "progress": progress,
            "evaluation": item.get("evaluation"),
        })
    return result


if __name__ == "__main__":
    import uvicorn
    print("🚀 تشغيل خادم Excel API على http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)