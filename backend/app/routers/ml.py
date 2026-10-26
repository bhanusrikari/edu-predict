from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services import ml_service
from app.schemas.ml import (
    TrainModelRequest, TrainModelResponse,
    SinglePredictionRequest, SinglePredictionResponse
)

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.post("/train", response_model=TrainModelResponse)
def train_models(
    request: TrainModelRequest = TrainModelRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        results = ml_service.train_and_evaluate_models(
            db=db,
            test_size=request.test_size,
            random_state=request.random_state
        )
        return results
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ml_service.get_latest_model_metrics(db)

@router.post("/predict-single", response_model=SinglePredictionResponse)
def predict_single(
    req: SinglePredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        features = {
            'attendance_rate': req.attendance_rate,
            'study_hours_per_week': req.study_hours_per_week,
            'assignments_completion_rate': req.assignments_completion_rate,
            'internal_marks': req.internal_marks,
            'mid_term_marks': req.mid_term_marks,
            'previous_semester_marks': req.previous_semester_marks
        }
        model_name = req.model_name or "random_forest"
        prediction = ml_service.predict_single(features, model_name=model_name)
        return prediction
    except FileNotFoundError:
        # Auto-train if models not yet created
        ml_service.train_and_evaluate_models(db)
        prediction = ml_service.predict_single(features, model_name=model_name)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@router.post("/batch-predict")
def batch_predict(
    model_name: str = "random_forest",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_count = ml_service.batch_update_student_predictions(db, model_name=model_name)
    return {"message": f"Successfully updated predictions for {updated_count} students."}
