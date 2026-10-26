import random
import json
import numpy as np
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.student import Student
from app.services.auth import hash_password
from app.services.student_service import calculate_performance_category, evaluate_risk
from app.services.ml_service import train_and_evaluate_models

DEPARTMENTS = [
    "Computer Science",
    "Information Technology",
    "Electronics & Comm",
    "Mechanical Eng",
    "Civil Eng"
]

FIRST_NAMES = [
    "Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Sneha", "Aditya", "Neha",
    "Rahul", "Pooja", "Arjun", "Kavya", "Siddharth", "Divya", "Karan", "Ishita",
    "Manish", "Riya", "Varun", "Tanvi", "Gaurav", "Simran", "Amit", "Nandini",
    "Nikhil", "Shreya", "Deepak", "Meera", "Abhishek", "Tara", "Kunal", "Anjali"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Singh", "Gupta", "Nair", "Rao",
    "Mehta", "Bose", "Das", "Joshi", "Iyer", "Chopra", "Malhotra", "Kapoor",
    "Saxena", "Bhatia", "Chatterjee", "Mishra", "Deshmukh", "Choudhury"
]

def seed_database(force_reseed: bool = False):
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Create Default Users
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin_user = User(
                username="admin",
                email="admin@academic.edu",
                full_name="System Administrator",
                role="admin",
                hashed_password=hash_password("admin123")
            )
            db.add(admin_user)
            print("Created default admin user (admin / admin123)")

        faculty = db.query(User).filter(User.username == "faculty").first()
        if not faculty:
            faculty_user = User(
                username="faculty",
                email="faculty@academic.edu",
                full_name="Prof. Sarah Jenkins",
                role="faculty",
                hashed_password=hash_password("faculty123")
            )
            db.add(faculty_user)
            print("Created default faculty user (faculty / faculty123)")

        db.commit()

        # 2. Check if student data already exists
        existing_count = db.query(Student).count()
        if existing_count >= 100 and not force_reseed:
            print(f"Database already contains {existing_count} students. Skipping student seeding.")
            # Ensure models are trained
            try:
                train_and_evaluate_models(db)
                print("Models checked and ready.")
            except Exception as e:
                print("Model training status:", e)
            return

        if force_reseed:
            db.query(Student).delete()
            db.commit()
            print("Cleared existing student records for re-seed.")

        # 3. Generate Realistic Correlated Student Records
        random.seed(42)
        np.random.seed(42)
        
        NUM_STUDENTS = 220
        students_to_add = []
        
        for i in range(1, NUM_STUDENTS + 1):
            s_id = f"STU-{1000 + i}"
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{i}@univ.edu"
            dept = random.choice(DEPARTMENTS)
            semester = random.randint(1, 8)
            gender = random.choice(["Male", "Female", "Other"])
            
            # Latent student aptitude / engagement factor (range 0.2 to 1.0)
            latent_ability = np.random.beta(5, 2.5)  # slight skew toward moderate-high
            
            # Sub-cohort: introduce ~20% at-risk students with struggling habits
            is_at_risk_cohort = (random.random() < 0.22)
            if is_at_risk_cohort:
                latent_ability = np.random.uniform(0.15, 0.45)
                att_base = np.random.uniform(42.0, 72.0)
                study_base = np.random.uniform(4.0, 10.0)
                assign_base = np.random.uniform(35.0, 65.0)
            else:
                att_base = np.random.uniform(74.0, 98.0)
                study_base = np.random.uniform(10.0, 32.0)
                assign_base = np.random.uniform(70.0, 99.0)

            attendance_rate = float(np.clip(att_base + np.random.normal(0, 3), 35.0, 100.0))
            study_hours = float(np.clip(study_base + np.random.normal(0, 2), 3.0, 45.0))
            assignments_rate = float(np.clip(assign_base + np.random.normal(0, 4), 25.0, 100.0))
            
            # Correlated test scores based on attendance, study hours, assignments, and latent ability
            base_score = (
                (attendance_rate * 0.25) +
                ((study_hours / 35.0 * 100.0) * 0.20) +
                (assignments_rate * 0.25) +
                (latent_ability * 100.0 * 0.30)
            )
            
            prev_marks = float(np.clip(base_score + np.random.normal(0, 6), 25.0, 99.0))
            internal_marks = float(np.clip(base_score + np.random.normal(0, 5), 20.0, 100.0))
            
            # Simulate occasional trajectory decline or sudden drop
            decline_shift = -15.0 if (is_at_risk_cohort and random.random() < 0.4) else 0.0
            mid_term_marks = float(np.clip(base_score + decline_shift + np.random.normal(0, 5), 20.0, 100.0))
            
            # Final marks
            final_marks = round(
                float(np.clip((internal_marks * 0.25) + (mid_term_marks * 0.35) + (prev_marks * 0.40) + np.random.normal(0, 3), 25.0, 100.0)),
                1
            )
            
            category = calculate_performance_category(final_marks)
            at_risk, risk_level, factors = evaluate_risk(
                attendance=attendance_rate,
                study_hours=study_hours,
                assignments=assignments_rate,
                internal=internal_marks,
                midterm=mid_term_marks,
                prev_sem=prev_marks,
                final_marks=final_marks
            )
            
            student = Student(
                student_id=s_id,
                name=name,
                email=email,
                department=dept,
                semester=semester,
                gender=gender,
                attendance_rate=round(attendance_rate, 1),
                study_hours_per_week=round(study_hours, 1),
                assignments_completion_rate=round(assignments_rate, 1),
                internal_marks=round(internal_marks, 1),
                mid_term_marks=round(mid_term_marks, 1),
                previous_semester_marks=round(prev_marks, 1),
                final_marks=final_marks,
                performance_category=category,
                at_risk=at_risk,
                risk_level=risk_level,
                risk_factors=json.dumps(factors)
            )
            students_to_add.append(student)

        db.add_all(students_to_add)
        db.commit()
        print(f"Seeded {len(students_to_add)} realistic student records.")
        
        # 4. Train the ML models immediately
        print("Training ML models on seeded dataset...")
        train_res = train_and_evaluate_models(db)
        print(f"ML Models trained successfully! Best model: {train_res['best_model']}")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database(force_reseed=True)
