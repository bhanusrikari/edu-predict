from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ModelMetric(BaseModel):
    model_name: str
    display_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    classes: List[str]
    classification_report: Dict[str, Any]

class TrainModelRequest(BaseModel):
    model_type: str = Field(default="all")  # 'logistic_regression', 'decision_tree', 'random_forest', or 'all'
    test_size: float = Field(default=0.2, ge=0.1, le=0.4)
    random_state: int = Field(default=42)

class TrainModelResponse(BaseModel):
    message: str
    best_model: str
    dataset_size: int
    train_size: int
    test_size: int
    models: List[ModelMetric]
    feature_importance: Optional[List[Dict[str, Any]]] = None

class SinglePredictionRequest(BaseModel):
    attendance_rate: float = Field(ge=0.0, le=100.0)
    study_hours_per_week: float = Field(ge=0.0, le=60.0)
    assignments_completion_rate: float = Field(ge=0.0, le=100.0)
    internal_marks: float = Field(ge=0.0, le=100.0)
    mid_term_marks: float = Field(ge=0.0, le=100.0)
    previous_semester_marks: float = Field(ge=0.0, le=100.0)
    model_name: Optional[str] = "random_forest"

class SinglePredictionResponse(BaseModel):
    predicted_category: str
    category_probabilities: Dict[str, float]
    predicted_marks: float
    confidence: float
    risk_assessment: str
    contributing_factors: List[str]
    recommendations: List[str]
