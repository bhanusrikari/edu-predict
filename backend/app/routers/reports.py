import json
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.services.auth import get_current_user
from app.services.recommendation_service import generate_student_recommendations

router = APIRouter(prefix="/reports", tags=["Reports & Recommendations"])

@router.get("/recommendations/{student_id}")
def get_recommendations(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return generate_student_recommendations(student)

@router.get("/student/{student_id}")
def get_student_report(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    recommendations = generate_student_recommendations(student)
    
    # Calculate peer comparisons in same department and semester
    peers = db.query(Student).filter(
        Student.department == student.department,
        Student.semester == student.semester
    ).all()
    
    dept_avg_marks = float(sum(p.final_marks or 0.0 for p in peers) / len(peers)) if peers else 0.0
    dept_avg_att = float(sum(p.attendance_rate for p in peers) / len(peers)) if peers else 0.0
    
    return {
        "student": {
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "department": student.department,
            "semester": student.semester,
            "gender": student.gender,
            "attendance_rate": student.attendance_rate,
            "study_hours_per_week": student.study_hours_per_week,
            "assignments_completion_rate": student.assignments_completion_rate,
            "internal_marks": student.internal_marks,
            "mid_term_marks": student.mid_term_marks,
            "previous_semester_marks": student.previous_semester_marks,
            "final_marks": student.final_marks,
            "performance_category": student.performance_category,
            "at_risk": student.at_risk,
            "risk_level": student.risk_level,
            "risk_factors": json.loads(student.risk_factors) if student.risk_factors else [],
            "predicted_category": student.predicted_category,
            "predicted_marks": student.predicted_marks,
            "prediction_confidence": student.prediction_confidence
        },
        "peer_comparison": {
            "peer_count": len(peers),
            "dept_avg_marks": round(dept_avg_marks, 2),
            "dept_avg_attendance": round(dept_avg_att, 2),
            "marks_delta": round((student.final_marks or 0.0) - dept_avg_marks, 2),
            "attendance_delta": round(student.attendance_rate - dept_avg_att, 2)
        },
        "recommendations": recommendations
    }

@router.get("/class-summary")
def get_class_summary(
    department: Optional[str] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    if department and department != "All":
        query = query.filter(Student.department == department)
    if semester and semester > 0:
        query = query.filter(Student.semester == semester)
        
    students = query.all()
    if not students:
        return {
            "total_students": 0,
            "average_marks": 0.0,
            "average_attendance": 0.0,
            "pass_rate": 0.0,
            "high_count": 0,
            "average_count": 0,
            "low_count": 0,
            "at_risk_count": 0,
            "students": []
        }
        
    marks = [s.final_marks or 0.0 for s in students]
    atts = [s.attendance_rate for s in students]
    passed = sum(1 for m in marks if m >= 50.0)
    
    return {
        "total_students": len(students),
        "average_marks": round(float(sum(marks) / len(students)), 2),
        "average_attendance": round(float(sum(atts) / len(students)), 2),
        "pass_rate": round((passed / len(students)) * 100, 2),
        "high_count": sum(1 for s in students if s.performance_category == "High"),
        "average_count": sum(1 for s in students if s.performance_category == "Average"),
        "low_count": sum(1 for s in students if s.performance_category == "Low"),
        "at_risk_count": sum(1 for s in students if s.at_risk),
        "students": [
            {
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "department": s.department,
                "semester": s.semester,
                "final_marks": s.final_marks,
                "attendance_rate": s.attendance_rate,
                "performance_category": s.performance_category,
                "at_risk": s.at_risk,
                "risk_level": s.risk_level
            }
            for s in students
        ]
    }
