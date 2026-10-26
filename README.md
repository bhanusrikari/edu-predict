# Student Performance Analysis and Prediction System (EduPredict)

An end-to-end, full-stack academic analytics platform that leverages **Data Mining** and **Machine Learning** techniques to analyze student academic histories, identify critical behavioral factors, classify performance tiers, detect at-risk students early, and generate personalized academic improvement interventions.

---

## 🎯 System Objectives
1. **Analyze Student Academic Records**: Process attendance, study habits, assignment completion rates, internal test scores, and semester examinations.
2. **Identify Critical Factors**: Perform Pearson correlation analysis and feature importance ranking to pinpoint behavioral drivers of student achievement.
3. **Predict Academic Performance**: Train and evaluate Logistic Regression, Decision Tree, and Random Forest classification models to predict student performance tiers (`High ≥ 75%`, `Average 50% - 74%`, `Low < 50%`) and expected marks.
4. **Early At-Risk Detection**: Flag students with critical attendance shortages (<75%), failing test scores, or declining mark trajectories before final exams.
5. **Personalized Recommendations**: Synthesize targeted remedial study schedules, peer tutoring pairings, and faculty mentoring intervention plans.
6. **Executive Analytics Dashboard**: Visualize institutional trends through interactive scatter plots, distribution donuts, and department benchmarks.
7. **Official Academic Reports**: Generate verifiable individual student transcript dossiers and class cohort summaries with export and print capabilities.

---

## 🏗️ Architecture & Technology Stack

```
EduPredict System
├── Frontend: React.js 18 + TypeScript + Tailwind CSS + Recharts + Lucide React (Vite)
├── Backend:  Python 3.13 + FastAPI + SQLAlchemy ORM + Pydantic v2
├── ML/EDA:   Scikit-Learn, Pandas, NumPy, Joblib
└── Storage:  SQLite (`student_performance.db`) + Serialized Pipelines (`saved_models/`)
```

### Frontend (`/frontend`)
- **Framework**: React.js 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (custom Navy, Indigo, and Teal color palette)
- **Visualizations**: Recharts (ScatterChart, PieChart, BarChart)
- **Iconography**: Lucide React
- **State & Auth**: React Context API with JWT session persistence

### Backend (`/backend`)
- **API Engine**: Python FastAPI (RESTful API architecture)
- **Database**: SQLite with SQLAlchemy 2.0 ORM
- **Security**: PBKDF2-SHA256 password hashing & PyJWT tokens with role-based access control (`admin` and `faculty`)
- **Data Mining & ML**:
  - **Feature Scaling**: `StandardScaler` (fitted strictly on training splits to prevent data leakage)
  - **Classifiers**: Logistic Regression, Decision Tree Classifier, Random Forest Classifier (100 estimators)
  - **Regressor**: Random Forest Regressor for continuous final mark estimation
  - **Metrics**: Accuracy, Precision (weighted), Recall (weighted), F1-Score, Confusion Matrix, Classification Reports
  - **Artifacts**: Joblib serialization into `backend/saved_models/`

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.13)
- **Node.js**: v18+ (tested on Node v22)
- **Git** (optional)

---

### 1. Backend Setup & Run

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd "backend"
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Seed the database with realistic sample data & train initial ML models:
   ```bash
   python -m app.seed_data
   ```

5. Start the FastAPI development server:
   ```bash
   python run.py
   ```
   *The backend API will start on **http://127.0.0.1:8000**.*
   *Interactive Swagger API documentation is available at **http://127.0.0.1:8000/docs**.*

---

### 2. Frontend Setup & Run

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd "frontend"
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be accessible at **http://localhost:5173**.*

---

## 🔐 Default Credentials & Roles

| Role | Username | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | Full access, model retraining, student CRUD, data upload/export |
| **Faculty Member** | `faculty` | `faculty123` | Student review, risk monitoring, recommendation plans, dossier prints |

*Note: Quick-login buttons are available directly on the login screen for instant demo access.*

---

## 📊 Performance Thresholds & Business Rules

- **High Performance Tier**: Final mark $\ge 75\%$
- **Average Performance Tier**: Final mark $\ge 50\%$ and $< 75\%$
- **Low Performance Tier**: Final mark $< 50\%$
- **At-Risk Criteria**:
  - Class attendance $< 75\%$ (attendance $< 65\%$ is flagged as High Risk)
  - Assignment submission rate $< 60\%$
  - Self-study hours $< 8$ hours/week
  - Internal or mid-term test score $< 50\%$
  - Declining mark trajectory across assessment cycles

---

## 📡 REST API Reference

All backend endpoints are prefixed with `/api/v1`.

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user and receive JWT bearer token |
| `POST` | `/api/v1/auth/register` | Register a new faculty or admin account |
| `GET` | `/api/v1/auth/me` | Retrieve authenticated user profile |

### Student Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/students` | List paginated students with search and filters |
| `GET` | `/api/v1/students/{id}` | Get full profile of a specific student |
| `POST` | `/api/v1/students` | Create a new student record (with auto-computed risk) |
| `PUT` | `/api/v1/students/{id}` | Update an existing student record |
| `DELETE` | `/api/v1/students/{id}` | Delete student record |
| `POST` | `/api/v1/students/upload-csv` | Bulk upload CSV dataset with deduplication & imputation |
| `GET` | `/api/v1/students/export/csv` | Download complete student records as CSV |

### Analytics & Data Mining
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/dashboard-summary` | Overall count, average mark, pass rate, and at-risk metrics |
| `GET` | `/api/v1/analytics/category-distribution` | Distribution of High, Average, and Low student tiers |
| `GET` | `/api/v1/analytics/attendance-vs-marks` | Scatter dataset correlating attendance and marks |
| `GET` | `/api/v1/analytics/semester-performance` | Semester-wise average mark and attendance trends |
| `GET` | `/api/v1/analytics/department-performance` | Department pass rate and at-risk density benchmarks |
| `GET` | `/api/v1/analytics/data-mining-insights` | Full correlation matrix, top factors, and key findings |

### Machine Learning
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/ml/train` | Retrain Logistic Regression, Decision Tree, and Random Forest |
| `GET` | `/api/v1/ml/metrics` | Model comparison metrics, F1-scores, and confusion matrices |
| `POST` | `/api/v1/ml/predict-single` | Real-time inference on input attributes (category, marks, probs) |
| `POST` | `/api/v1/ml/batch-predict` | Re-score all database student records using the active model |

### At-Risk Detection & Recommendations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/at-risk/students` | Filtered list of students requiring academic intervention |
| `GET` | `/api/v1/at-risk/summary` | Root-cause breakdown of flagged risk triggers |
| `GET` | `/api/v1/reports/recommendations/{student_id}` | AI-generated personalized action plan and faculty mentoring notes |
| `GET` | `/api/v1/reports/student/{student_id}` | Full student academic dossier with peer comparison |
| `GET` | `/api/v1/reports/class-summary` | Aggregated class/cohort summary |

---

## 🧪 CSV Upload Format
When uploading custom student datasets, use a standard CSV file with the following columns:
```csv
student_id,name,department,semester,gender,attendance,study_hours,assignments,internal,midterm,prev_marks,final
STU-2001,Alex Morgan,Computer Science,5,Female,88.5,18.0,92.0,78.0,82.0,80.0,81.5
STU-2002,Brian Patel,Mechanical Eng,4,Male,62.0,6.0,45.0,42.0,40.0,52.0,43.5
```
*Missing values will automatically be imputed using cohort medians, and duplicates will be reconciled based on `student_id`.*

---

## 🛡️ Data Leakage Prevention & ML Rigor
- **Pre-split Isolation**: Feature normalization scalers (`StandardScaler`) are fit strictly on the training partition ($80\%$) and applied down to the test partition ($20\%$).
- **Stratified Sampling**: Train/test splitting enforces stratified distribution of High, Average, and Low classes.
- **Ensemble Validation**: Models are evaluated and compared on untouched test data with accuracy, precision, recall, and F1-score matrices.
- **Model Persistence**: Models are serialized using `joblib` so predictions are reproducible without retraining.

---

## 📄 License
This project is developed for educational and academic analytics purposes.
