import json
import io
import pandas as pd
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate
from app.config import settings

def calculate_performance_category(marks: float) -> str:
    if marks is None:
        return "Average"
    if marks >= settings.HIGH_PERFORMANCE_THRESHOLD:
        return "High"
    elif marks >= settings.AVERAGE_PERFORMANCE_THRESHOLD:
        return "Average"
    else:
        return "Low"

def evaluate_risk(
    attendance: float,
    study_hours: float,
    assignments: float,
    internal: float,
    midterm: float,
    prev_sem: float,
    final_marks: Optional[float] = None
) -> Tuple[bool, str, List[str]]:
    """
    Evaluate student risk level and identify specific contributing factors.
    Returns: (at_risk: bool, risk_level: str, factors: List[str])
    """
    factors = []
    
    # Check factors
    if attendance < 65.0:
        factors.append(f"Severe attendance shortage ({attendance:.1f}%)")
    elif attendance < 75.0:
        factors.append(f"Attendance below requirement ({attendance:.1f}%)")
        
    if assignments < 60.0:
        factors.append(f"Low assignment completion ({assignments:.1f}%)")
        
    if study_hours < 8.0:
        factors.append(f"Critically low study hours ({study_hours:.1f} hrs/week)")
        
    if internal < 50.0:
        factors.append(f"Failing internal marks ({internal:.1f}/100)")
        
    if midterm < 50.0:
        factors.append(f"Failing mid-term marks ({midterm:.1f}/100)")
        
    # Check declining trend
    if (midterm < internal - 8.0) or (internal < prev_sem - 10.0):
        factors.append("Declining mark trajectory across assessment periods")
        
    if final_marks is not None and final_marks < 50.0:
        factors.append(f"Low overall academic standing ({final_marks:.1f}/100)")
        
    # Determine risk category
    if len(factors) >= 3 or attendance < 60.0 or (midterm < 40.0 and internal < 40.0):
        return True, "High", factors
    elif len(factors) >= 1 or attendance < 75.0 or midterm < 50.0:
        return True, "Medium", factors
    else:
        return False, "Low" if (attendance < 80.0 or study_hours < 12.0) else "None", factors

def get_students(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    department: Optional[str] = None,
    semester: Optional[int] = None,
    category: Optional[str] = None,
    at_risk_only: Optional[bool] = None
) -> Tuple[List[Student], int]:
    query = db.query(Student)
    
    if search:
        search_filter = or_(
            Student.name.ilike(f"%{search}%"),
            Student.student_id.ilike(f"%{search}%"),
            Student.email.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        
    if department and department != "All":
        query = query.filter(Student.department == department)
        
    if semester and semester > 0:
        query = query.filter(Student.semester == semester)
        
    if category and category != "All":
        query = query.filter(Student.performance_category == category)
        
    if at_risk_only is True:
        query = query.filter(Student.at_risk == True)
        
    total = query.count()
    students = query.order_by(desc(Student.id)).offset(skip).limit(limit).all()
    return students, total

def get_student_by_id(db: Session, student_id: int) -> Optional[Student]:
    return db.query(Student).filter(Student.id == student_id).first()

def get_student_by_student_id(db: Session, student_code: str) -> Optional[Student]:
    return db.query(Student).filter(Student.student_id == student_code).first()

def create_student(db: Session, student_in: StudentCreate) -> Student:
    # Compute effective composite mark if final_marks not provided
    marks_for_cat = student_in.final_marks
    if marks_for_cat is None:
        marks_for_cat = round(
            (student_in.internal_marks * 0.25) +
            (student_in.mid_term_marks * 0.35) +
            (student_in.previous_semester_marks * 0.40),
            2
        )
        
    category = calculate_performance_category(marks_for_cat)
    at_risk, risk_level, factors = evaluate_risk(
        attendance=student_in.attendance_rate,
        study_hours=student_in.study_hours_per_week,
        assignments=student_in.assignments_completion_rate,
        internal=student_in.internal_marks,
        midterm=student_in.mid_term_marks,
        prev_sem=student_in.previous_semester_marks,
        final_marks=marks_for_cat
    )
    
    db_student = Student(
        student_id=student_in.student_id,
        name=student_in.name,
        email=student_in.email or f"{student_in.student_id.lower()}@univ.edu",
        department=student_in.department,
        semester=student_in.semester,
        gender=student_in.gender,
        attendance_rate=student_in.attendance_rate,
        study_hours_per_week=student_in.study_hours_per_week,
        assignments_completion_rate=student_in.assignments_completion_rate,
        internal_marks=student_in.internal_marks,
        mid_term_marks=student_in.mid_term_marks,
        previous_semester_marks=student_in.previous_semester_marks,
        final_marks=student_in.final_marks if student_in.final_marks is not None else marks_for_cat,
        performance_category=category,
        at_risk=at_risk,
        risk_level=risk_level,
        risk_factors=json.dumps(factors)
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student_in: StudentUpdate) -> Optional[Student]:
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return None
        
    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_student, field, value)
        
    # Re-evaluate category and risk
    marks_for_cat = db_student.final_marks
    if marks_for_cat is None:
        marks_for_cat = round(
            (db_student.internal_marks * 0.25) +
            (db_student.mid_term_marks * 0.35) +
            (db_student.previous_semester_marks * 0.40),
            2
        )
        db_student.final_marks = marks_for_cat

    db_student.performance_category = calculate_performance_category(marks_for_cat)
    at_risk, risk_level, factors = evaluate_risk(
        attendance=db_student.attendance_rate,
        study_hours=db_student.study_hours_per_week,
        assignments=db_student.assignments_completion_rate,
        internal=db_student.internal_marks,
        midterm=db_student.mid_term_marks,
        prev_sem=db_student.previous_semester_marks,
        final_marks=marks_for_cat
    )
    db_student.at_risk = at_risk
    db_student.risk_level = risk_level
    db_student.risk_factors = json.dumps(factors)
    
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int) -> bool:
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return False
    db.delete(db_student)
    db.commit()
    return True

def process_csv_upload(db: Session, csv_content: bytes) -> Dict[str, Any]:
    """
    Parse, validate, handle missing values, eliminate duplicates, and insert students.
    """
    df = pd.read_csv(io.BytesIO(csv_content))
    initial_count = len(df)
    
    # Required columns or aliases
    col_mapping = {
        'id': 'student_id',
        'roll_no': 'student_id',
        'roll_number': 'student_id',
        'student_code': 'student_id',
        'full_name': 'name',
        'attendance': 'attendance_rate',
        'study_hours': 'study_hours_per_week',
        'assignments': 'assignments_completion_rate',
        'internal': 'internal_marks',
        'midterm': 'mid_term_marks',
        'mid_term': 'mid_term_marks',
        'prev_marks': 'previous_semester_marks',
        'previous_marks': 'previous_semester_marks',
        'final': 'final_marks'
    }
    
    df.rename(columns={k: v for k, v in col_mapping.items() if k in df.columns}, inplace=True)
    
    # Check essential column
    if 'student_id' not in df.columns:
        df['student_id'] = [f"STU-{1000 + i}" for i in range(len(df))]
    if 'name' not in df.columns:
        df['name'] = [f"Student {s_id}" for s_id in df['student_id']]
    if 'department' not in df.columns:
        df['department'] = 'Computer Science'
    if 'semester' not in df.columns:
        df['semester'] = 5
    if 'gender' not in df.columns:
        df['gender'] = 'Other'

    # Deduplicate within uploaded file
    df_dedup = df.drop_duplicates(subset=['student_id'], keep='first')
    duplicates_in_file = initial_count - len(df_dedup)
    
    # Numeric column defaults & imputation
    numeric_cols = [
        'attendance_rate', 'study_hours_per_week', 'assignments_completion_rate',
        'internal_marks', 'mid_term_marks', 'previous_semester_marks', 'final_marks'
    ]
    missing_handled = 0
    for col in numeric_cols:
        if col in df_dedup.columns:
            null_count = df_dedup[col].isnull().sum()
            missing_handled += int(null_count)
            # Impute missing values with column median or realistic default
            median_val = df_dedup[col].median()
            default_val = median_val if pd.notna(median_val) else (75.0 if 'attendance' in col or 'assignments' in col else (15.0 if 'hours' in col else 60.0))
            df_dedup[col] = df_dedup[col].fillna(default_val)
        else:
            default_val = 75.0 if 'attendance' in col or 'assignments' in col else (15.0 if 'hours' in col else 65.0)
            df_dedup[col] = default_val

    # Clip ranges
    df_dedup['attendance_rate'] = df_dedup['attendance_rate'].clip(0.0, 100.0)
    df_dedup['assignments_completion_rate'] = df_dedup['assignments_completion_rate'].clip(0.0, 100.0)
    df_dedup['study_hours_per_week'] = df_dedup['study_hours_per_week'].clip(0.0, 60.0)
    df_dedup['internal_marks'] = df_dedup['internal_marks'].clip(0.0, 100.0)
    df_dedup['mid_term_marks'] = df_dedup['mid_term_marks'].clip(0.0, 100.0)
    df_dedup['previous_semester_marks'] = df_dedup['previous_semester_marks'].clip(0.0, 100.0)
    df_dedup['final_marks'] = df_dedup['final_marks'].clip(0.0, 100.0)

    inserted = 0
    updated = 0
    
    for _, row in df_dedup.iterrows():
        s_id = str(row['student_id']).strip()
        existing = db.query(Student).filter(Student.student_id == s_id).first()
        
        marks_for_cat = float(row['final_marks'])
        category = calculate_performance_category(marks_for_cat)
        at_risk, risk_level, factors = evaluate_risk(
            attendance=float(row['attendance_rate']),
            study_hours=float(row['study_hours_per_week']),
            assignments=float(row['assignments_completion_rate']),
            internal=float(row['internal_marks']),
            midterm=float(row['mid_term_marks']),
            prev_sem=float(row['previous_semester_marks']),
            final_marks=marks_for_cat
        )
        
        if existing:
            existing.name = str(row['name'])
            existing.department = str(row['department'])
            existing.semester = int(row['semester'])
            existing.gender = str(row.get('gender', 'Other'))
            existing.attendance_rate = float(row['attendance_rate'])
            existing.study_hours_per_week = float(row['study_hours_per_week'])
            existing.assignments_completion_rate = float(row['assignments_completion_rate'])
            existing.internal_marks = float(row['internal_marks'])
            existing.mid_term_marks = float(row['mid_term_marks'])
            existing.previous_semester_marks = float(row['previous_semester_marks'])
            existing.final_marks = marks_for_cat
            existing.performance_category = category
            existing.at_risk = at_risk
            existing.risk_level = risk_level
            existing.risk_factors = json.dumps(factors)
            updated += 1
        else:
            new_student = Student(
                student_id=s_id,
                name=str(row['name']),
                email=f"{s_id.lower()}@univ.edu",
                department=str(row['department']),
                semester=int(row['semester']),
                gender=str(row.get('gender', 'Other')),
                attendance_rate=float(row['attendance_rate']),
                study_hours_per_week=float(row['study_hours_per_week']),
                assignments_completion_rate=float(row['assignments_completion_rate']),
                internal_marks=float(row['internal_marks']),
                mid_term_marks=float(row['mid_term_marks']),
                previous_semester_marks=float(row['previous_semester_marks']),
                final_marks=marks_for_cat,
                performance_category=category,
                at_risk=at_risk,
                risk_level=risk_level,
                risk_factors=json.dumps(factors)
            )
            db.add(new_student)
            inserted += 1
            
    db.commit()
    
    return {
        "total_records_read": initial_count,
        "duplicates_removed": duplicates_in_file,
        "missing_values_handled": missing_handled,
        "records_inserted": inserted,
        "records_updated": updated,
        "message": f"Successfully processed {len(df_dedup)} records ({inserted} created, {updated} updated)."
    }
