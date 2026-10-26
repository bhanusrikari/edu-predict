from typing import List, Dict, Any

def generate_student_recommendations(student: Any) -> Dict[str, Any]:
    """
    Generate personalized academic improvement recommendations based on
    attendance, study habits, assignments, marks trajectory, and risk factors.
    """
    recommendations: List[str] = []
    action_plan: List[Dict[str, str]] = []
    interventions: List[str] = []
    
    # 1. Attendance Analysis
    att = float(student.attendance_rate)
    if att < 65.0:
        recommendations.append(f"Critical Attendance Shortage ({att:.1f}%): Enroll in mandatory attendance recovery and daily check-ins.")
        action_plan.append({
            "area": "Attendance Recovery",
            "action": "Attend all upcoming lecture sessions and contact the academic advisor weekly to maintain attendance logs.",
            "priority": "High",
            "timeframe": "Immediate (Weeks 1-4)"
        })
        interventions.append("Parent/Guardian notification and attendance counseling session.")
    elif att < 75.0:
        recommendations.append(f"Low Attendance ({att:.1f}%): Target a minimum of 85% attendance in remaining classes to avoid exam debarment.")
        action_plan.append({
            "area": "Attendance Monitoring",
            "action": "Ensure no unexcused absences. Review timetable to resolve commute or scheduling conflicts.",
            "priority": "Medium",
            "timeframe": "Ongoing"
        })

    # 2. Study Hours & Time Management
    hours = float(student.study_hours_per_week)
    if hours < 8.0:
        recommendations.append(f"Insufficient Self-Study ({hours:.1f} hrs/week): Establish a structured daily study schedule targeting 15+ hours/week.")
        action_plan.append({
            "area": "Study Habit Formation",
            "action": "Dedicate two 90-minute focused study blocks every weekday utilizing active recall and Pomodoro technique.",
            "priority": "High",
            "timeframe": "Within 7 days"
        })
    elif hours < 14.0:
        recommendations.append(f"Moderate Self-Study ({hours:.1f} hrs/week): Increase weekend revision by 3-4 hours focusing on challenging technical topics.")
        action_plan.append({
            "area": "Revision Expansion",
            "action": "Block Saturday mornings for weekly review and problem-solving exercises.",
            "priority": "Low",
            "timeframe": "Next 2 weeks"
        })

    # 3. Assignment Completion
    assign = float(student.assignments_completion_rate)
    if assign < 60.0:
        recommendations.append(f"Incomplete Assignments ({assign:.1f}%): Schedule peer study sessions and attend teaching assistant office hours.")
        action_plan.append({
            "area": "Coursework Catch-up",
            "action": "Submit all pending homework tasks and attend weekly tutorial clinics for problem troubleshooting.",
            "priority": "High",
            "timeframe": "Next 10 days"
        })
        interventions.append("Assign a senior peer mentor to review homework drafts 48 hours before deadlines.")
    elif assign < 80.0:
        recommendations.append(f"Assignment Consistency ({assign:.1f}%): Aim for 90%+ completion to secure continuous evaluation marks.")

    # 4. Internal and Midterm Marks Analysis
    internal = float(student.internal_marks)
    midterm = float(student.mid_term_marks)
    prev = float(student.previous_semester_marks)
    
    # Check for declining trend
    is_declining = (midterm < internal - 8.0) or (internal < prev - 10.0)
    if is_declining:
        recommendations.append("Declining Performance Trend: Formative assessments reveal dropped scores compared to baseline. Remedial review needed.")
        action_plan.append({
            "area": "Remedial Coaching",
            "action": "Schedule a diagnostic review with the course instructor to pinpoint concepts missed on midterm exams.",
            "priority": "High",
            "timeframe": "Within 2 weeks"
        })
        interventions.append("Enroll in faculty-led remedial workshop and practice mock question sets.")

    if internal < 50.0 or midterm < 50.0:
        recommendations.append("Core Concept Deficit: Score is below passing threshold in mid-term or internal assessments.")
        action_plan.append({
            "area": "Foundational Strengthening",
            "action": "Complete guided practice exercises from textbook chapters 1-4 and re-take self-assessment quizzes.",
            "priority": "High",
            "timeframe": "Immediate"
        })

    # 5. High Performer Guidance
    composite = (internal * 0.3) + (midterm * 0.3) + (prev * 0.4)
    if composite >= 75.0 and att >= 80.0:
        recommendations.append("High Performance Track: Candidate qualifies for honors projects, research assistantships, and competitive hackathons.")
        action_plan.append({
            "area": "Advanced Enrichment",
            "action": "Participate in department research initiatives or mentor struggling peers through the Student Success Center.",
            "priority": "Medium",
            "timeframe": "Current Semester"
        })

    if not recommendations:
        recommendations.append("Consistent Good Standing: Maintain current study routines, assignment submission pace, and lecture attendance.")
        action_plan.append({
            "area": "Performance Maintenance",
            "action": "Keep tracking weekly goals and prepare early for end-semester examinations.",
            "priority": "Low",
            "timeframe": "Full Semester"
        })

    return {
        "student_id": student.student_id,
        "name": student.name,
        "summary": f"{'At-Risk' if getattr(student, 'at_risk', False) else 'Satisfactory'} academic profile with {len(recommendations)} recommended action items.",
        "recommendations": recommendations,
        "action_plan": action_plan,
        "interventions": interventions
    }
