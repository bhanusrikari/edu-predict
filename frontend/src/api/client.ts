import {
  User, Student, StudentPagination, DashboardSummary,
  CategoryDistribution, AttendanceMarksPoint, SubjectSemesterPerformance,
  DepartmentPerformance, DataMiningInsights, ModelMetric,
  TrainModelResponse, SinglePredictionRequest, SinglePredictionResponse,
  AtRiskSummary, StudentReport, RecommendationPlan
} from '../types';

const BASE_URL = '/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('edu_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new ApiError(errorDetail, response.status);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me');
  },

  // Students
  async getStudents(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    semester?: number;
    category?: string;
    atRisk?: boolean;
  } = {}): Promise<StudentPagination> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.pageSize) query.set('page_size', params.pageSize.toString());
    if (params.search) query.set('search', params.search);
    if (params.department && params.department !== 'All') query.set('department', params.department);
    if (params.semester && params.semester > 0) query.set('semester', params.semester.toString());
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.atRisk !== undefined) query.set('at_risk', params.atRisk.toString());

    return request(`/students?${query.toString()}`);
  },

  async getStudent(id: number): Promise<Student> {
    return request(`/students/${id}`);
  },

  async createStudent(data: Partial<Student>): Promise<Student> {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    return request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStudent(id: number): Promise<{ message: string }> {
    return request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadCsv(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getAuthHeader();

    const response = await fetch(`${BASE_URL}/students/upload-csv`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new ApiError(err.detail || 'Upload failed', response.status);
    }
    return response.json();
  },

  getExportCsvUrl(): string {
    return `${BASE_URL}/students/export/csv`;
  },

  // Analytics
  async getDashboardSummary(): Promise<DashboardSummary> {
    return request('/analytics/dashboard-summary');
  },

  async getCategoryDistribution(): Promise<CategoryDistribution[]> {
    return request('/analytics/category-distribution');
  },

  async getAttendanceVsMarks(): Promise<AttendanceMarksPoint[]> {
    return request('/analytics/attendance-vs-marks');
  },

  async getSemesterPerformance(): Promise<SubjectSemesterPerformance[]> {
    return request('/analytics/semester-performance');
  },

  async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
    return request('/analytics/department-performance');
  },

  async getDataMiningInsights(): Promise<DataMiningInsights> {
    return request('/analytics/data-mining-insights');
  },

  // Machine Learning
  async trainModels(testSize: number = 0.2): Promise<TrainModelResponse> {
    return request('/ml/train', {
      method: 'POST',
      body: JSON.stringify({ test_size: testSize }),
    });
  },

  async getModelMetrics(): Promise<ModelMetric[]> {
    return request('/ml/metrics');
  },

  async predictSingle(data: SinglePredictionRequest): Promise<SinglePredictionResponse> {
    return request('/ml/predict-single', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async batchPredict(modelName: string = 'random_forest'): Promise<{ message: string }> {
    return request(`/ml/batch-predict?model_name=${modelName}`, {
      method: 'POST',
    });
  },

  // At-Risk
  async getAtRiskStudents(riskLevel?: string, department?: string): Promise<Student[]> {
    const query = new URLSearchParams();
    if (riskLevel && riskLevel !== 'All') query.set('risk_level', riskLevel);
    if (department && department !== 'All') query.set('department', department);
    return request(`/at-risk/students?${query.toString()}`);
  },

  async getAtRiskSummary(): Promise<AtRiskSummary> {
    return request('/at-risk/summary');
  },

  // Reports
  async getStudentReport(studentId: number): Promise<StudentReport> {
    return request(`/reports/student/${studentId}`);
  },

  async getRecommendations(studentId: number): Promise<RecommendationPlan> {
    return request(`/reports/recommendations/${studentId}`);
  },

  async getClassSummary(department?: string, semester?: number): Promise<any> {
    const query = new URLSearchParams();
    if (department && department !== 'All') query.set('department', department);
    if (semester && semester > 0) query.set('semester', semester.toString());
    return request(`/reports/class-summary?${query.toString()}`);
  },
};
