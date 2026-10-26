import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Student } from '../types';
import {
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  X,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface StudentsListProps {
  onSelectStudentForReport?: (studentId: number) => void;
  onSelectStudentForRec?: (studentId: number) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  onSelectStudentForReport,
  onSelectStudentForRec,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState<number>(0);
  const [category, setCategory] = useState('All');
  const [atRiskFilter, setAtRiskFilter] = useState<string>('All');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: 'Computer Science',
    semester: 5,
    gender: 'Male',
    attendance_rate: 80,
    study_hours_per_week: 15,
    assignments_completion_rate: 85,
    internal_marks: 70,
    mid_term_marks: 72,
    previous_semester_marks: 75,
    final_marks: 74,
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const atRiskParam =
        atRiskFilter === 'All' ? undefined : atRiskFilter === 'Yes';
      const data = await api.getStudents({
        page,
        pageSize,
        search: search.trim() || undefined,
        department,
        semester,
        category,
        atRisk: atRiskParam,
      });
      setStudents(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, department, semester, category, atRiskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedStudent(null);
    setFormData({
      student_id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      email: '',
      department: 'Computer Science',
      semester: 5,
      gender: 'Male',
      attendance_rate: 80,
      study_hours_per_week: 15,
      assignments_completion_rate: 85,
      internal_marks: 70,
      mid_term_marks: 72,
      previous_semester_marks: 75,
      final_marks: 74,
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setIsEditing(true);
    setSelectedStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      email: student.email || '',
      department: student.department,
      semester: student.semester,
      gender: student.gender,
      attendance_rate: student.attendance_rate,
      study_hours_per_week: student.study_hours_per_week,
      assignments_completion_rate: student.assignments_completion_rate,
      internal_marks: student.internal_marks,
      mid_term_marks: student.mid_term_marks,
      previous_semester_marks: student.previous_semester_marks,
      final_marks: student.final_marks || 0,
    });
    setShowAddEditModal(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedStudent) {
        await api.updateStudent(selectedStudent.id, formData);
      } else {
        await api.createStudent(formData);
      }
      setShowAddEditModal(false);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Error saving student');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await api.deleteStudent(id);
        fetchStudents();
      } catch (err: any) {
        alert(err.message || 'Error deleting student');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const res = await api.uploadCsv(file);
      setUploadStatus(res);
      fetchStudents();
    } catch (err: any) {
      setUploadStatus({ error: err.message || 'Failed to upload CSV' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Student Directory</h2>
          <p className="text-xs text-slate-500">
            Total of <span className="font-semibold text-indigo-600">{total}</span> student records in the system
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>

          <a
            href={api.getExportCsvUrl()}
            download="students_export.csv"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Comm">Electronics & Comm</option>
            <option value="Mechanical Eng">Mechanical Eng</option>
            <option value="Civil Eng">Civil Eng</option>
          </select>

          <select
            value={semester}
            onChange={(e) => { setSemester(Number(e.target.value)); setPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={0}>All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Tiers</option>
            <option value="High">High (≥75%)</option>
            <option value="Average">Average (50-74%)</option>
            <option value="Low">Low (&lt;50%)</option>
          </select>

          <select
            value={atRiskFilter}
            onChange={(e) => { setAtRiskFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Risk Statuses</option>
            <option value="Yes">⚠️ At-Risk Only</option>
            <option value="No">✅ Safe Only</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            Loading records...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student ID & Name</th>
                  <th className="py-3 px-4">Department & Sem</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-center">Study Hrs</th>
                  <th className="py-3 px-4 text-center">Marks</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-center">Risk Status</th>
                  <th className="py-3 px-4 text-center">ML Prediction</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => {
                  const riskFactorsList: string[] = student.risk_factors
                    ? JSON.parse(student.risk_factors)
                    : [];

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] font-mono text-indigo-600">
                          {student.student_id}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{student.department}</div>
                        <div className="text-[11px] text-slate-400">Semester {student.semester}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        <span
                          className={`font-semibold ${
                            student.attendance_rate < 75 ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {student.attendance_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-800">
                        {student.study_hours_per_week} hrs
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {student.final_marks !== null ? `${student.final_marks}%` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            student.performance_category === 'High'
                              ? 'bg-emerald-100 text-emerald-700'
                              : student.performance_category === 'Average'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {student.performance_category || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {student.at_risk ? (
                          <span
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                            title={riskFactorsList.join(', ')}
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{student.risk_level} Risk</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Safe</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {student.predicted_category ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-semibold text-indigo-700 flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>{student.predicted_category}</span>
                            </span>
                            {student.predicted_marks && (
                              <span className="text-[10px] text-slate-400">
                                ~{student.predicted_marks}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> ({total} items)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg font-medium transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg font-medium transition-colors flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Edit Record: ${selectedStudent?.name}` : 'Register New Student'}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical Eng">Mechanical Eng</option>
                    <option value="Civil Eng">Civil Eng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
                  Academic & Behavioral Attributes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Attendance Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      value={formData.attendance_rate}
                      onChange={(e) => setFormData({ ...formData, attendance_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Study Hours / Week
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="0.5"
                      required
                      value={formData.study_hours_per_week}
                      onChange={(e) => setFormData({ ...formData, study_hours_per_week: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assignments Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      value={formData.assignments_completion_rate}
                      onChange={(e) => setFormData({ ...formData, assignments_completion_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Marks</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.internal_marks}
                    onChange={(e) => setFormData({ ...formData, internal_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Midterm Marks</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.mid_term_marks}
                    onChange={(e) => setFormData({ ...formData, mid_term_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Sem Marks</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.previous_semester_marks}
                    onChange={(e) => setFormData({ ...formData, previous_semester_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Final Marks</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.final_marks}
                    onChange={(e) => setFormData({ ...formData, final_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs font-mono text-indigo-600">{selectedStudent.student_id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 font-medium">Department & Semester</div>
                <div className="text-slate-900 font-semibold">{selectedStudent.department} (Sem {selectedStudent.semester})</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 font-medium">Class Attendance</div>
                <div className="text-slate-900 font-semibold">{selectedStudent.attendance_rate}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 font-medium">Study Habits</div>
                <div className="text-slate-900 font-semibold">
                  {selectedStudent.study_hours_per_week} hrs/wk • {selectedStudent.assignments_completion_rate}% Assignments
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-slate-500 font-medium">Cumulative Standing</div>
                <div className="text-slate-900 font-semibold">
                  {selectedStudent.final_marks}% ({selectedStudent.performance_category} Tier)
                </div>
              </div>
            </div>

            {selectedStudent.at_risk && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs mb-5">
                <div className="font-bold text-rose-800 flex items-center space-x-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Risk Level: {selectedStudent.risk_level}</span>
                </div>
                <div className="text-rose-700 space-y-0.5">
                  {JSON.parse(selectedStudent.risk_factors || '[]').map((f: string, i: number) => (
                    <div key={i}>• {f}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
              {onSelectStudentForRec && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    onSelectStudentForRec(selectedStudent.id);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  View Action Plan
                </button>
              )}
              {onSelectStudentForReport && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    onSelectStudentForReport(selectedStudent.id);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Full Dossier Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Dataset Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Upload CSV Dataset</h3>
              </div>
              <button
                onClick={() => { setShowUploadModal(false); setUploadStatus(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Upload student records with columns: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">student_id, name, department, semester, attendance, study_hours, assignments, internal, midterm, prev_marks, final</code>.
              Duplicates will be merged and missing values automatically imputed.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="csv-file-input"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {isUploading ? 'Validating & Ingesting Dataset...' : 'Click to select CSV file'}
                </span>
                <span className="text-[11px] text-slate-400">Supported format: .csv</span>
              </label>
            </div>

            {uploadStatus && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs ${
                  uploadStatus.error
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {uploadStatus.error ? (
                  <div>{uploadStatus.error}</div>
                ) : (
                  <div>
                    <div className="font-bold mb-1">✅ Upload Processed Successfully!</div>
                    <div>• Records read: {uploadStatus.total_records_read}</div>
                    <div>• Duplicates filtered: {uploadStatus.duplicates_removed}</div>
                    <div>• Missing values handled: {uploadStatus.missing_values_handled}</div>
                    <div>• New records inserted: {uploadStatus.records_inserted}</div>
                    <div>• Existing records updated: {uploadStatus.records_updated}</div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => { setShowUploadModal(false); setUploadStatus(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
