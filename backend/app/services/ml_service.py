import os
import joblib
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

from app.models.student import Student
from app.models.ml_model_record import MLModelRecord
from app.config import settings

FEATURE_COLUMNS = [
    'attendance_rate',
    'study_hours_per_week',
    'assignments_completion_rate',
    'internal_marks',
    'mid_term_marks',
    'previous_semester_marks'
]

CLASS_LABELS = ['High', 'Average', 'Low']

def get_training_dataset(db: Session) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    students = db.query(Student).all()
    if len(students) < 20:
        raise ValueError("At least 20 student records are required to train machine learning models reliably.")
        
    records = []
    y_cat = []
    y_reg = []
    
    for s in students:
        final_m = s.final_marks
        if final_m is None:
            final_m = (s.internal_marks * 0.25) + (s.mid_term_marks * 0.35) + (s.previous_semester_marks * 0.40)
            
        cat = s.performance_category
        if not cat:
            if final_m >= settings.HIGH_PERFORMANCE_THRESHOLD:
                cat = "High"
            elif final_m >= settings.AVERAGE_PERFORMANCE_THRESHOLD:
                cat = "Average"
            else:
                cat = "Low"
                
        records.append({
            'attendance_rate': s.attendance_rate,
            'study_hours_per_week': s.study_hours_per_week,
            'assignments_completion_rate': s.assignments_completion_rate,
            'internal_marks': s.internal_marks,
            'mid_term_marks': s.mid_term_marks,
            'previous_semester_marks': s.previous_semester_marks
        })
        y_cat.append(cat)
        y_reg.append(float(final_m))
        
    df_X = pd.DataFrame(records)
    s_y_cat = pd.Series(y_cat)
    s_y_reg = pd.Series(y_reg)
    
    return df_X, s_y_cat, s_y_reg

def train_and_evaluate_models(
    db: Session,
    test_size: float = 0.2,
    random_state: int = 42
) -> Dict[str, Any]:
    X, y_cat, y_reg = get_training_dataset(db)
    
    # Train / test split (stratified on category to ensure proportional representation)
    try:
        X_train, X_test, y_train, y_test, y_reg_train, y_reg_test = train_test_split(
            X, y_cat, y_reg, test_size=test_size, random_state=random_state, stratify=y_cat
        )
    except ValueError:
        # Fallback if a class has too few instances to stratify
        X_train, X_test, y_train, y_test, y_reg_train, y_reg_test = train_test_split(
            X, y_cat, y_reg, test_size=test_size, random_state=random_state
        )

    # Standard scaling fitted strictly on training partition (preventing data leakage)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Model 1: Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=random_state)
    lr.fit(X_train_scaled, y_train)
    
    # Model 2: Decision Tree
    dt = DecisionTreeClassifier(max_depth=6, min_samples_split=4, random_state=random_state)
    dt.fit(X_train, y_train)  # Tree models operate well on unscaled features
    
    # Model 3: Random Forest Classifier
    rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=random_state)
    rf.fit(X_train, y_train)
    
    # Marks Regressor: Random Forest Regressor
    regressor = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=random_state)
    regressor.fit(X_train, y_reg_train)
    
    models_dict = {
        "logistic_regression": {
            "model": lr,
            "scaler": scaler,
            "uses_scaler": True,
            "display_name": "Logistic Regression",
            "X_eval": X_test_scaled
        },
        "decision_tree": {
            "model": dt,
            "scaler": None,
            "uses_scaler": False,
            "display_name": "Decision Tree Classifier",
            "X_eval": X_test
        },
        "random_forest": {
            "model": rf,
            "scaler": None,
            "uses_scaler": False,
            "display_name": "Random Forest Classifier",
            "X_eval": X_test
        }
    }
    
    evaluated_models: List[Dict[str, Any]] = []
    best_f1 = -1.0
    best_model_name = "random_forest"
    
    # Save artifacts directory
    os.makedirs(settings.MODELS_DIR, exist_ok=True)
    
    # Clear existing active flags in DB
    db.query(MLModelRecord).update({"is_active": False})
    
    for key, item in models_dict.items():
        clf = item["model"]
        X_eval = item["X_eval"]
        y_pred = clf.predict(X_eval)
        
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
        cm = confusion_matrix(y_test, y_pred, labels=CLASS_LABELS).tolist()
        report = classification_report(y_test, y_pred, labels=CLASS_LABELS, output_dict=True, zero_division=0)
        
        # Feature importance
        feat_imp = []
        if hasattr(clf, "feature_importances_"):
            importances = clf.feature_importances_
            feat_imp = [
                {"feature": FEATURE_COLUMNS[i], "importance": round(float(importances[i]), 4)}
                for i in range(len(FEATURE_COLUMNS))
            ]
            feat_imp = sorted(feat_imp, key=lambda x: x["importance"], reverse=True)
        elif hasattr(clf, "coef_"):
            mean_coefs = np.mean(np.abs(clf.coef_), axis=0)
            norm_coefs = mean_coefs / np.sum(mean_coefs)
            feat_imp = [
                {"feature": FEATURE_COLUMNS[i], "importance": round(float(norm_coefs[i]), 4)}
                for i in range(len(FEATURE_COLUMNS))
            ]
            feat_imp = sorted(feat_imp, key=lambda x: x["importance"], reverse=True)
            
        # Serialize model package (model + scaler + features)
        artifact_path = os.path.join(settings.MODELS_DIR, f"{key}.joblib")
        joblib.dump({
            "model": clf,
            "scaler": item["scaler"],
            "uses_scaler": item["uses_scaler"],
            "features": FEATURE_COLUMNS,
            "classes": CLASS_LABELS
        }, artifact_path)
        
        # Save record in database
        db_record = MLModelRecord(
            name=key,
            model_type="classification",
            accuracy=f"{round(acc * 100, 2)}%",
            metrics=json.dumps({
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "confusion_matrix": cm,
                "classes": CLASS_LABELS,
                "classification_report": report
            }),
            feature_importance=json.dumps(feat_imp),
            is_active=False,
            file_path=artifact_path,
            dataset_size=len(X)
        )
        db.add(db_record)
        
        evaluated_models.append({
            "model_name": key,
            "display_name": item["display_name"],
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm,
            "classes": CLASS_LABELS,
            "classification_report": report,
            "feature_importance": feat_imp
        })
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = key
            
    # Save marks regressor
    regressor_path = os.path.join(settings.MODELS_DIR, "marks_regressor.joblib")
    joblib.dump({"regressor": regressor, "features": FEATURE_COLUMNS}, regressor_path)
    
    # Mark the best model as active
    best_record = db.query(MLModelRecord).filter(MLModelRecord.name == best_model_name).order_by(MLModelRecord.id.desc()).first()
    if best_record:
        best_record.is_active = True
        
    db.commit()
    
    # Batch update student predictions in database using the best model
    batch_update_student_predictions(db, best_model_name)
    
    # Get best model's feature importance
    best_feat_imp = next((m["feature_importance"] for m in evaluated_models if m["model_name"] == best_model_name), [])
    
    return {
        "message": f"Successfully trained and evaluated 3 classification models and 1 marks regressor.",
        "best_model": best_model_name,
        "dataset_size": len(X),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "models": evaluated_models,
        "feature_importance": best_feat_imp
    }

def get_saved_model(model_name: str = "random_forest") -> Optional[Dict[str, Any]]:
    artifact_path = os.path.join(settings.MODELS_DIR, f"{model_name}.joblib")
    if not os.path.exists(artifact_path):
        return None
    return joblib.load(artifact_path)

def get_saved_regressor() -> Optional[Dict[str, Any]]:
    artifact_path = os.path.join(settings.MODELS_DIR, "marks_regressor.joblib")
    if not os.path.exists(artifact_path):
        return None
    return joblib.load(artifact_path)

def predict_single(
    features_dict: Dict[str, float],
    model_name: str = "random_forest"
) -> Dict[str, Any]:
    model_pkg = get_saved_model(model_name)
    if not model_pkg:
        # Fall back to training or default heuristic if model not yet saved
        raise FileNotFoundError(f"Model '{model_name}' has not been trained yet. Please initiate training first.")
        
    clf = model_pkg["model"]
    scaler = model_pkg.get("scaler")
    uses_scaler = model_pkg.get("uses_scaler", False)
    classes = model_pkg.get("classes", CLASS_LABELS)
    
    feature_df = pd.DataFrame([{
        'attendance_rate': features_dict['attendance_rate'],
        'study_hours_per_week': features_dict['study_hours_per_week'],
        'assignments_completion_rate': features_dict['assignments_completion_rate'],
        'internal_marks': features_dict['internal_marks'],
        'mid_term_marks': features_dict['mid_term_marks'],
        'previous_semester_marks': features_dict['previous_semester_marks']
    }])
    
    if uses_scaler and scaler is not None:
        X_in = scaler.transform(feature_df)
    else:
        X_in = feature_df
        
    pred_category = clf.predict(X_in)[0]
    probabilities = {}
    confidence = 0.85
    if hasattr(clf, "predict_proba"):
        probs = clf.predict_proba(X_in)[0]
        for c, p in zip(clf.classes_, probs):
            probabilities[str(c)] = round(float(p), 3)
        confidence = round(float(np.max(probs)), 3)
        
    # Expected marks prediction via regressor
    predicted_marks = None
    reg_pkg = get_saved_regressor()
    if reg_pkg:
        reg = reg_pkg["regressor"]
        predicted_marks = round(float(reg.predict(feature_df)[0]), 2)
    else:
        # Weighted fallback calculation
        predicted_marks = round(
            (features_dict['internal_marks'] * 0.25) +
            (features_dict['mid_term_marks'] * 0.35) +
            (features_dict['previous_semester_marks'] * 0.40),
            2
        )

    # Risk evaluation
    factors = []
    if features_dict['attendance_rate'] < 75.0:
        factors.append(f"Low Attendance ({features_dict['attendance_rate']:.1f}%)")
    if features_dict['assignments_completion_rate'] < 60.0:
        factors.append("Low Assignment Completion")
    if features_dict['study_hours_per_week'] < 8.0:
        factors.append("Insufficient Study Hours")
    if features_dict['mid_term_marks'] < 50.0:
        factors.append("Failing Mid-term Mark")
    if pred_category == "Low":
        factors.append("Model Predicted Low Performance")
        
    risk_level = "High" if len(factors) >= 2 or pred_category == "Low" else ("Medium" if len(factors) == 1 else "Low")
    
    # Recommendations
    recs = []
    if features_dict['attendance_rate'] < 75.0:
        recs.append("Increase classroom attendance to minimum 80% to avoid academic penalties.")
    if features_dict['study_hours_per_week'] < 12.0:
        recs.append("Increase weekly focused study time to at least 15 hours.")
    if features_dict['assignments_completion_rate'] < 70.0:
        recs.append("Submit weekly homework assignments promptly to boost continuous evaluation.")
    if features_dict['mid_term_marks'] < 55.0:
        recs.append("Attend faculty revision clinics and solve previous semester exam problems.")
    if not recs:
        recs.append("Maintain high-standard study routines and explore peer mentoring opportunities.")
        
    return {
        "predicted_category": pred_category,
        "category_probabilities": probabilities,
        "predicted_marks": predicted_marks,
        "confidence": confidence,
        "risk_assessment": risk_level,
        "contributing_factors": factors,
        "recommendations": recs
    }

def batch_update_student_predictions(db: Session, model_name: str = "random_forest") -> int:
    model_pkg = get_saved_model(model_name)
    reg_pkg = get_saved_regressor()
    if not model_pkg:
        return 0
        
    clf = model_pkg["model"]
    scaler = model_pkg.get("scaler")
    uses_scaler = model_pkg.get("uses_scaler", False)
    
    students = db.query(Student).all()
    if not students:
        return 0
        
    data = []
    for s in students:
        data.append([
            s.attendance_rate,
            s.study_hours_per_week,
            s.assignments_completion_rate,
            s.internal_marks,
            s.mid_term_marks,
            s.previous_semester_marks
        ])
        
    X_df = pd.DataFrame(data, columns=FEATURE_COLUMNS)
    if uses_scaler and scaler is not None:
        X_trans = scaler.transform(X_df)
    else:
        X_trans = X_df
        
    preds = clf.predict(X_trans)
    confidences = [0.85] * len(students)
    if hasattr(clf, "predict_proba"):
        probs = clf.predict_proba(X_trans)
        confidences = [round(float(np.max(p)), 3) for p in probs]
        
    reg_preds = None
    if reg_pkg:
        reg = reg_pkg["regressor"]
        reg_preds = reg.predict(X_df)
        
    for i, s in enumerate(students):
        s.predicted_category = str(preds[i])
        s.prediction_confidence = float(confidences[i])
        if reg_preds is not None:
            s.predicted_marks = round(float(reg_preds[i]), 2)
            
    db.commit()
    return len(students)

def get_latest_model_metrics(db: Session) -> List[Dict[str, Any]]:
    records = db.query(MLModelRecord).order_by(MLModelRecord.id.desc()).limit(3).all()
    results = []
    for r in records:
        metrics = json.loads(r.metrics) if r.metrics else {}
        feat_imp = json.loads(r.feature_importance) if r.feature_importance else []
        results.append({
            "model_name": r.name,
            "display_name": r.name.replace("_", " ").title(),
            "accuracy": metrics.get("accuracy", 0.0),
            "precision": metrics.get("precision", 0.0),
            "recall": metrics.get("recall", 0.0),
            "f1_score": metrics.get("f1_score", 0.0),
            "confusion_matrix": metrics.get("confusion_matrix", []),
            "classes": metrics.get("classes", CLASS_LABELS),
            "classification_report": metrics.get("classification_report", {}),
            "feature_importance": feat_imp,
            "is_active": r.is_active,
            "trained_at": r.trained_at.isoformat() if r.trained_at else None
        })
    return results
