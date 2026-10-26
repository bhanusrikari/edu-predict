export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'faculty';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string | null;
  department: string;
  semester: number;
  gender: string;
  attendance_rate: number;
  study_hours_per_week: number;
  assignments_completion_rate: number;
  internal_marks: number;
  mid_term_marks: number;
  previous_semester_marks: number;
  final_marks: number | null;
  performance_category: 'High' | 'Average' | 'Low' | null;
  at_risk: boolean;
  risk_level: 'High' | 'Medium' | 'Low' | 'None';
  risk_factors: string; // JSON string
  predicted_category?: 'High' | 'Average' | 'Low' | null;
  predicted_marks?: number | null;
  prediction_confidence?: number | null;
  created_at: string;
  updated_at: string;
}

export interface StudentPagination {
  items: Student[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardSummary {
  total_students: number;
  average_marks: number;
  pass_percentage: number;
  at_risk_count: number;
  high_performers_count: number;
  average_performers_count: number;
  low_performers_count: number;
  avg_attendance: number;
  avg_study_hours: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface AttendanceMarksPoint {
  student_id: string;
  name: string;
  attendance_rate: number;
  marks: number;
  category: string;
  at_risk: boolean;
}

export interface SubjectSemesterPerformance {
  semester: number;
  average_marks: number;
  average_attendance: number;
  total_students: number;
}

export interface DepartmentPerformance {
  department: string;
  average_marks: number;
  average_attendance: number;
  total_students: number;
  at_risk_count: number;
  pass_rate: number;
}

export interface CorrelationMatrix {
  features: string[];
  matrix: number[][];
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  impact_direction: string;
}

export interface DataMiningInsights {
  total_records: number;
  missing_values_handled: number;
  duplicates_removed: number;
  correlations: CorrelationMatrix;
  top_correlations_with_marks: Array<{
    feature: string;
    correlation: number;
    impact: string;
  }>;
  key_findings: string[];
  feature_importance: FeatureImportanceItem[];
}

export interface ModelMetric {
  model_name: string;
  display_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  classes: string[];
  classification_report: Record<string, any>;
  feature_importance?: Array<{ feature: string; importance: number }>;
  is_active?: boolean;
  trained_at?: string;
}

export interface TrainModelResponse {
  message: string;
  best_model: string;
  dataset_size: number;
  train_size: number;
  test_size: number;
  models: ModelMetric[];
  feature_importance?: Array<{ feature: string; importance: number }>;
}

export interface SinglePredictionRequest {
  attendance_rate: number;
  study_hours_per_week: number;
  assignments_completion_rate: number;
  internal_marks: number;
  mid_term_marks: number;
  previous_semester_marks: number;
  model_name?: string;
}

export interface SinglePredictionResponse {
  predicted_category: string;
  category_probabilities: Record<string, number>;
  predicted_marks: number;
  confidence: number;
  risk_assessment: string;
  contributing_factors: string[];
  recommendations: string[];
}

export interface AtRiskSummary {
  total_at_risk: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  factor_breakdown: Array<{ factor: string; count: number }>;
}

export interface RecommendationPlan {
  student_id: string;
  name: string;
  summary: string;
  recommendations: string[];
  action_plan: Array<{
    area: string;
    action: string;
    priority: string;
    timeframe: string;
  }>;
  interventions: string[];
}

export interface StudentReport {
  student: Student & { risk_factors: string[] };
  peer_comparison: {
    peer_count: number;
    dept_avg_marks: number;
    dept_avg_attendance: number;
    marks_delta: number;
    attendance_delta: number;
  };
  recommendations: RecommendationPlan;
}
