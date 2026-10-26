import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.student import StudentCreate, StudentUpdate, StudentOut, StudentPagination
from app.services.auth import get_current_user
from app.services import student_service

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=StudentPagination)
def list_students(
    page: int = 1,
    page_size: int = 15,
    search: Optional[str] = None,
    department: Optional[str] = None,
    semester: Optional[int] = None,
    category: Optional[str] = None,
    at_risk: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skip = (page - 1) * page_size
    items, total = student_service.get_students(
        db=db,
        skip=skip,
        limit=page_size,
        search=search,
        department=department,
        semester=semester,
        category=category,
        at_risk_only=at_risk
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{id}", response_model=StudentOut)
def get_student(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = student_service.get_student_by_id(db, id)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")
    return student

@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(student_in: StudentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = student_service.get_student_by_student_id(db, student_in.student_id)
    if existing:
        raise HTTPException(status_code=400, detail=f"Student ID '{student_in.student_id}' already exists")
    return student_service.create_student(db, student_in)

@router.put("/{id}", response_model=StudentOut)
def update_student(id: int, student_in: StudentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = student_service.update_student(db, id, student_in)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")
    return student

@router.delete("/{id}")
def delete_student(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = student_service.delete_student(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Student record not found")
    return {"message": "Student record deleted successfully"}

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported")
    content = await file.read()
    try:
        result = student_service.process_csv_upload(db, content)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")

@router.get("/export/csv")
def export_students_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    students, _ = student_service.get_students(db=db, skip=0, limit=10000)
    
    headers = [
        "student_id", "name", "email", "department", "semester", "gender",
        "attendance_rate", "study_hours_per_week", "assignments_completion_rate",
        "internal_marks", "mid_term_marks", "previous_semester_marks", "final_marks",
        "performance_category", "at_risk", "risk_level"
    ]
    
    csv_rows = [",".join(headers)]
    for s in students:
        row = [
            f'"{s.student_id}"',
            f'"{s.name}"',
            f'"{s.email or ""}"',
            f'"{s.department}"',
            str(s.semester),
            f'"{s.gender}"',
            str(s.attendance_rate),
            str(s.study_hours_per_week),
            str(s.assignments_completion_rate),
            str(s.internal_marks),
            str(s.mid_term_marks),
            str(s.previous_semester_marks),
            str(s.final_marks if s.final_marks is not None else ""),
            f'"{s.performance_category or ""}"',
            str(s.at_risk),
            f'"{s.risk_level or "None"}"'
        ]
        csv_rows.append(",".join(row))
        
    csv_data = "\n".join(csv_rows)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_export.csv"}
    )
