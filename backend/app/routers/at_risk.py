from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.schemas.student import StudentOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/at-risk", tags=["At-Risk Students"])

@router.get("/students", response_model=List[StudentOut])
def get_at_risk_students(
    risk_level: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student).filter(Student.at_risk == True)
    if risk_level and risk_level != "All":
        query = query.filter(Student.risk_level == risk_level)
    if department and department != "All":
        query = query.filter(Student.department == department)
        
    return query.order_by(desc(Student.risk_level == "High"), desc(Student.id)).all()

@router.get("/summary")
def get_at_risk_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    students = db.query(Student).filter(Student.at_risk == True).all()
    high_count = sum(1 for s in students if s.risk_level == "High")
    med_count = sum(1 for s in students if s.risk_level == "Medium")
    low_count = sum(1 for s in students if s.risk_level == "Low")
    
    # Common risk factor breakdown
    factor_counts = {
        "Attendance Shortage (<75%)": 0,
        "Low Assignment Completion (<60%)": 0,
        "Low Study Hours (<8 hrs)": 0,
        "Failing Internal Marks (<50)": 0,
        "Failing Midterm Marks (<50)": 0,
        "Declining Trajectory": 0
    }
    
    for s in students:
        if s.attendance_rate < 75.0:
            factor_counts["Attendance Shortage (<75%)"] += 1
        if s.assignments_completion_rate < 60.0:
            factor_counts["Low Assignment Completion (<60%)"] += 1
        if s.study_hours_per_week < 8.0:
            factor_counts["Low Study Hours (<8 hrs)"] += 1
        if s.internal_marks < 50.0:
            factor_counts["Failing Internal Marks (<50)"] += 1
        if s.mid_term_marks < 50.0:
            factor_counts["Failing Midterm Marks (<50)"] += 1
        if (s.mid_term_marks < s.internal_marks - 8.0) or (s.internal_marks < s.previous_semester_marks - 10.0):
            factor_counts["Declining Trajectory"] += 1

    return {
        "total_at_risk": len(students),
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "factor_breakdown": [
            {"factor": k, "count": v} for k, v in factor_counts.items()
        ]
    }
