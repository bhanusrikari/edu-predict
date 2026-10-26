from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummary(BaseModel):
    total_students: int
    average_marks: float
    pass_percentage: float
    at_risk_count: int
    high_performers_count: int
    average_performers_count: int
    low_performers_count: int
    avg_attendance: float
    avg_study_hours: float

class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float

class AttendanceMarksPoint(BaseModel):
    student_id: str
    name: str
    attendance_rate: float
    marks: float
    category: str
    at_risk: bool

class SubjectSemesterPerformance(BaseModel):
    semester: int
    average_marks: float
    average_attendance: float
    total_students: int

class DepartmentPerformance(BaseModel):
    department: str
    average_marks: float
    average_attendance: float
    total_students: int
    at_risk_count: int
    pass_rate: float

class CorrelationMatrix(BaseModel):
    features: List[str]
    matrix: List[List[float]]

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    impact_direction: str  # positive, negative

class DataMiningInsights(BaseModel):
    total_records: int
    missing_values_handled: int
    duplicates_removed: int
    correlations: CorrelationMatrix
    top_correlations_with_marks: List[Dict[str, Any]]
    key_findings: List[str]
    feature_importance: List[FeatureImportanceItem]
