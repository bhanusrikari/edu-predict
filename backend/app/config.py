import os

class Settings:
    PROJECT_NAME: str = "Student Performance Analysis and Prediction System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-for-student-performance-system-2025")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'student_performance.db')}"
    MODELS_DIR: str = os.path.join(BASE_DIR, "saved_models")
    
    # Thresholds
    HIGH_PERFORMANCE_THRESHOLD: float = 75.0
    AVERAGE_PERFORMANCE_THRESHOLD: float = 50.0

settings = Settings()
os.makedirs(settings.MODELS_DIR, exist_ok=True)
