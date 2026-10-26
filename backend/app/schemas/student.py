from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    student_id: str
    name: str
    email: Optional[str] = None
    department: str
    semester: int = Field(ge=1, le=8)
    gender: str = "Other"
    
    attendance_rate: float = Field(ge=0.0, le=100.0)
    study_hours_per_week: float = Field(ge=0.0, le=60.0)
    assignments_completion_rate: float = Field(ge=0.0, le=100.0)
    internal_marks: float = Field(ge=0.0, le=100.0)
    mid_term_marks: float = Field(ge=0.0, le=100.0)
    previous_semester_marks: float = Field(ge=0.0, le=100.0)
    final_marks: Optional[float] = Field(default=None, ge=0.0, le=100.0)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = Field(default=None, ge=1, le=8)
    gender: Optional[str] = None
    attendance_rate: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    study_hours_per_week: Optional[float] = Field(default=None, ge=0.0, le=60.0)
    assignments_completion_rate: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    internal_marks: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    mid_term_marks: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    previous_semester_marks: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    final_marks: Optional[float] = Field(default=None, ge=0.0, le=100.0)

class StudentOut(StudentBase):
    id: int
    performance_category: Optional[str] = None
    at_risk: bool
    risk_level: str
    risk_factors: str  # JSON list
    predicted_category: Optional[str] = None
    predicted_marks: Optional[float] = None
    prediction_confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentPagination(BaseModel):
    items: List[StudentOut]
    total: int
    page: int
    page_size: int
    total_pages: int
