import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student import Student
from app.config import settings

def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    students = db.query(Student).all()
    total = len(students)
    if total == 0:
        return {
            "total_students": 0,
            "average_marks": 0.0,
            "pass_percentage": 0.0,
            "at_risk_count": 0,
            "high_performers_count": 0,
            "average_performers_count": 0,
            "low_performers_count": 0,
            "avg_attendance": 0.0,
            "avg_study_hours": 0.0
        }
        
    marks = [s.final_marks if s.final_marks is not None else 0.0 for s in students]
    attendances = [s.attendance_rate for s in students]
    study_hours = [s.study_hours_per_week for s in students]
    
    avg_marks = float(np.mean(marks))
    passed = sum(1 for m in marks if m >= settings.AVERAGE_PERFORMANCE_THRESHOLD)
    pass_pct = round((passed / total) * 100, 2)
    
    at_risk = sum(1 for s in students if s.at_risk)
    high_count = sum(1 for s in students if s.performance_category == "High")
    avg_count = sum(1 for s in students if s.performance_category == "Average")
    low_count = sum(1 for s in students if s.performance_category == "Low")
    
    return {
        "total_students": total,
        "average_marks": round(avg_marks, 2),
        "pass_percentage": pass_pct,
        "at_risk_count": at_risk,
        "high_performers_count": high_count,
        "average_performers_count": avg_count,
        "low_performers_count": low_count,
        "avg_attendance": round(float(np.mean(attendances)), 2),
        "avg_study_hours": round(float(np.mean(study_hours)), 2)
    }

def get_category_distribution(db: Session) -> List[Dict[str, Any]]:
    students = db.query(Student).all()
    total = len(students)
    if total == 0:
        return [
            {"category": "High", "count": 0, "percentage": 0.0},
            {"category": "Average", "count": 0, "percentage": 0.0},
            {"category": "Low", "count": 0, "percentage": 0.0}
        ]
        
    categories = {"High": 0, "Average": 0, "Low": 0}
    for s in students:
        cat = s.performance_category or "Average"
        categories[cat] = categories.get(cat, 0) + 1
        
    return [
        {
            "category": cat,
            "count": count,
            "percentage": round((count / total) * 100, 2)
        }
        for cat, count in categories.items()
    ]

def get_attendance_vs_marks(db: Session, sample_limit: int = 250) -> List[Dict[str, Any]]:
    students = db.query(Student).limit(sample_limit).all()
    return [
        {
            "student_id": s.student_id,
            "name": s.name,
            "attendance_rate": round(s.attendance_rate, 1),
            "marks": round(s.final_marks if s.final_marks is not None else 0.0, 1),
            "category": s.performance_category or "Average",
            "at_risk": s.at_risk
        }
        for s in students
    ]

def get_semester_performance(db: Session) -> List[Dict[str, Any]]:
    results = (
        db.query(
            Student.semester,
            func.avg(Student.final_marks).label("avg_marks"),
            func.avg(Student.attendance_rate).label("avg_attendance"),
            func.count(Student.id).label("total")
        )
        .group_by(Student.semester)
        .order_by(Student.semester)
        .all()
    )
    return [
        {
            "semester": r.semester,
            "average_marks": round(float(r.avg_marks or 0.0), 2),
            "average_attendance": round(float(r.avg_attendance or 0.0), 2),
            "total_students": r.total
        }
        for r in results
    ]

def get_department_performance(db: Session) -> List[Dict[str, Any]]:
    students = db.query(Student).all()
    if not students:
        return []
        
    dept_map: Dict[str, List[Student]] = {}
    for s in students:
        dept_map.setdefault(s.department, []).append(s)
        
    results = []
    for dept, s_list in dept_map.items():
        marks = [s.final_marks if s.final_marks is not None else 0.0 for s in s_list]
        atts = [s.attendance_rate for s in s_list]
        passed = sum(1 for m in marks if m >= settings.AVERAGE_PERFORMANCE_THRESHOLD)
        at_risk = sum(1 for s in s_list if s.at_risk)
        
        results.append({
            "department": dept,
            "average_marks": round(float(np.mean(marks)), 2),
            "average_attendance": round(float(np.mean(atts)), 2),
            "total_students": len(s_list),
            "at_risk_count": at_risk,
            "pass_rate": round((passed / len(s_list)) * 100, 2)
        })
        
    return sorted(results, key=lambda x: x["department"])

def get_data_mining_insights(db: Session) -> Dict[str, Any]:
    students = db.query(Student).all()
    if not students:
        return {
            "total_records": 0,
            "missing_values_handled": 0,
            "duplicates_removed": 0,
            "correlations": {"features": [], "matrix": []},
            "top_correlations_with_marks": [],
            "key_findings": ["No student records found in the database. Please generate seed data or upload a dataset."],
            "feature_importance": []
        }
        
    feature_names = [
        "Attendance Rate", "Study Hours", "Assignment Completion",
        "Internal Marks", "Midterm Marks", "Previous Sem Marks", "Final Marks"
    ]
    
    data = []
    for s in students:
        data.append([
            s.attendance_rate,
            s.study_hours_per_week,
            s.assignments_completion_rate,
            s.internal_marks,
            s.mid_term_marks,
            s.previous_semester_marks,
            s.final_marks if s.final_marks is not None else 0.0
        ])
        
    df = pd.DataFrame(data, columns=feature_names)
    corr_matrix = df.corr().round(3)
    
    # Extract top correlations with final marks
    marks_corr = corr_matrix["Final Marks"].drop("Final Marks").sort_values(ascending=False)
    top_corr = [
        {"feature": feature, "correlation": float(corr), "impact": "Positive" if corr > 0 else "Negative"}
        for feature, corr in marks_corr.items()
    ]
    
    # Key insights & findings
    findings = []
    if not marks_corr.empty:
        highest_factor = marks_corr.index[0]
        findings.append(f"Strongest predictor of student achievement is '{highest_factor}' with a correlation coefficient of r = {marks_corr.iloc[0]:.2f}.")
        if "Attendance Rate" in marks_corr and marks_corr["Attendance Rate"] > 0.4:
            findings.append(f"Consistent attendance demonstrates a significant positive relationship (r = {marks_corr['Attendance Rate']:.2f}) with final assessment scores.")
        if "Study Hours" in marks_corr and marks_corr["Study Hours"] > 0.3:
            findings.append(f"Weekly independent study volume contributes directly to score improvements (r = {marks_corr['Study Hours']:.2f}).")
            
        low_att_risk = sum(1 for s in students if s.attendance_rate < 75.0)
        findings.append(f"{low_att_risk} students ({round(low_att_risk/len(students)*100, 1)}%) currently attend fewer than 75% of academic sessions.")
        
    # Feature importance estimation (using normalized absolute correlations as baseline)
    total_abs = marks_corr.abs().sum()
    feature_importance = [
        {
            "feature": feat,
            "importance": round(float(abs(val) / total_abs), 3) if total_abs > 0 else 0.0,
            "impact_direction": "positive" if val >= 0 else "negative"
        }
        for feat, val in marks_corr.items()
    ]
    
    return {
        "total_records": len(students),
        "missing_values_handled": 0,
        "duplicates_removed": 0,
        "correlations": {
            "features": feature_names,
            "matrix": corr_matrix.values.tolist()
        },
        "top_correlations_with_marks": top_corr,
        "key_findings": findings,
        "feature_importance": feature_importance
    }
