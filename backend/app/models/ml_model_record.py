from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime
from app.database import Base

class MLModelRecord(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # logistic_regression, decision_tree, random_forest
    model_type = Column(String(20), default="classification")  # classification, regression
    accuracy = Column(String(50), nullable=True)
    metrics = Column(Text, nullable=True)  # JSON string of detailed metrics
    feature_importance = Column(Text, nullable=True)  # JSON string
    is_active = Column(Boolean, default=False)
    file_path = Column(String(255), nullable=True)
    dataset_size = Column(Integer, default=0)
    trained_at = Column(DateTime, default=datetime.utcnow)
