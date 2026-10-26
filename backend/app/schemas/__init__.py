from app.schemas.user import UserBase, UserCreate, UserLogin, UserOut, Token, TokenData
from app.schemas.student import StudentBase, StudentCreate, StudentUpdate, StudentOut, StudentPagination
from app.schemas.analytics import (
    DashboardSummary, CategoryDistribution, AttendanceMarksPoint,
    SubjectSemesterPerformance, DepartmentPerformance, CorrelationMatrix,
    FeatureImportanceItem, DataMiningInsights
)
from app.schemas.ml import (
    ModelMetric, TrainModelRequest, TrainModelResponse,
    SinglePredictionRequest, SinglePredictionResponse
)

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserOut", "Token", "TokenData",
    "StudentBase", "StudentCreate", "StudentUpdate", "StudentOut", "StudentPagination",
    "DashboardSummary", "CategoryDistribution", "AttendanceMarksPoint",
    "SubjectSemesterPerformance", "DepartmentPerformance", "CorrelationMatrix",
    "FeatureImportanceItem", "DataMiningInsights",
    "ModelMetric", "TrainModelRequest", "TrainModelResponse",
    "SinglePredictionRequest", "SinglePredictionResponse"
]
