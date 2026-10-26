from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from datetime import datetime
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False, index=True)
    email = Column(String(120), nullable=True)
    department = Column(String(50), nullable=False, index=True)
    semester = Column(Integer, nullable=False, index=True)
    gender = Column(String(20), default="Other")
    
    # Academic & Behavioral Attributes
    attendance_rate = Column(Float, nullable=False)  # Percentage (0-100)
    study_hours_per_week = Column(Float, nullable=False)  # Hours (0-60)
    assignments_completion_rate = Column(Float, nullable=False)  # Percentage (0-100)
    internal_marks = Column(Float, nullable=False)  # 0-100
    mid_term_marks = Column(Float, nullable=False)  # 0-100
    previous_semester_marks = Column(Float, nullable=False)  # 0-100
    final_marks = Column(Float, nullable=True)  # Ground truth if available
    
    # Classification & Risk Analysis
    performance_category = Column(String(20), nullable=True)  # High, Average, Low
    at_risk = Column(Boolean, default=False, index=True)
    risk_level = Column(String(20), default="None")  # High, Medium, Low, None
    risk_factors = Column(Text, default="[]")  # JSON string list of reasons
    
    # ML Prediction fields
    predicted_category = Column(String(20), nullable=True)
    predicted_marks = Column(Float, nullable=True)
    prediction_confidence = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
