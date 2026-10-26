from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services import analytics_service
from app.schemas.analytics import DashboardSummary, DataMiningInsights

router = APIRouter(prefix="/analytics", tags=["Analytics & Data Mining"])

@router.get("/dashboard-summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_dashboard_summary(db)

@router.get("/category-distribution")
def get_category_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_category_distribution(db)

@router.get("/attendance-vs-marks")
def get_attendance_vs_marks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_attendance_vs_marks(db)

@router.get("/semester-performance")
def get_semester_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_semester_performance(db)

@router.get("/department-performance")
def get_department_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_department_performance(db)

@router.get("/data-mining-insights", response_model=DataMiningInsights)
def get_data_mining_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_data_mining_insights(db)
