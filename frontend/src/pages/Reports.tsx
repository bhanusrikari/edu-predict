import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { StudentReport, Student } from '../types';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Filter,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface ReportsProps {
  initialStudentId?: number | null;
}

export const Reports: React.FC<ReportsProps> = ({ initialStudentId }) => {
  const [reportType, setReportType] = useState<'individual' | 'class'>('individual');
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(initialStudentId || null);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Class report states
  const [classDept, setClassDept] = useState('All');
  const [classSem, setClassSem] = useState(0);
  const [classSummary, setClassSummary] = useState<any>(null);

  // Load students for selector
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await api.getStudents({ page: 1, pageSize: 200 });
        setStudentsList(res.items);
        if (!selectedStudentId && res.items.length > 0) {
          setSelectedStudentId(res.items[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStudents();
  }, []);

  // Load individual report
  useEffect(() => {
    if (reportType !== 'individual' || !selectedStudentId) return;
    async function fetchStudentReport() {
      setLoading(true);
      try {
        const rep = await api.getStudentReport(selectedStudentId!);
        setStudentReport(rep);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudentReport();
  }, [reportType, selectedStudentId]);

  // Load class report
  useEffect(() => {
    if (reportType !== 'class') return;
    async function fetchClassSummary() {
      setLoading(true);
      try {
        const rep = await api.getClassSummary(classDept, classSem);
        setClassSummary(rep);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClassSummary();
  }, [reportType, classDept, classSem]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Academic Evaluation Reports & Dossiers</h2>
          <p className="text-xs text-slate-500">
            Official institutional transcript dossiers, peer benchmarks, and class-level cohorts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setReportType('individual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reportType === 'individual' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-600'
              }`}
            >
              Student Transcript
            </button>
            <button
              onClick={() => setReportType('class')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reportType === 'class' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-600'
              }`}
            >
              Class Cohort Report
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Filter Selector Row */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        {reportType === 'individual' ? (
          <div className="flex items-center space-x-3 w-full">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Select Student:
            </label>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 max-w-sm"
            >
              {studentsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.student_id}) — {s.department}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-700">Department:</label>
              <select
                value={classDept}
                onChange={(e) => setClassDept(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Mechanical Eng">Mechanical Eng</option>
                <option value="Civil Eng">Civil Eng</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-700">Semester:</label>
              <select
                value={classSem}
                onChange={(e) => setClassSem(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value={0}>All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Report Content Body */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          Compiling academic report dossier...
        </div>
      ) : reportType === 'individual' && studentReport ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 max-w-4xl mx-auto space-y-6">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-indigo-600 pb-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">
                  UNIVERSITY ACADEMIC EVALUATION SYSTEM
                </h1>
                <p className="text-xs text-slate-500">
                  Comprehensive Student Performance Profile & Predictive Assessment Dossier
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Status: <span className="text-emerald-600 font-bold">VERIFIED</span></div>
            </div>
          </div>

          {/* Student Bio Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{studentReport.student.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Enrollment ID</span>
              <span className="font-bold text-indigo-700 text-sm font-mono">{studentReport.student.student_id}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Department</span>
              <span className="font-bold text-slate-900 text-sm">{studentReport.student.department}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Semester</span>
              <span className="font-bold text-slate-900 text-sm">Semester {studentReport.student.semester}</span>
            </div>
          </div>

          {/* Quantitative Performance Metrics */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Formative & Summative Academic Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="text-[11px] text-slate-500">Attendance Rate</div>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {studentReport.student.attendance_rate}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="text-[11px] text-slate-500">Study Volume</div>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {studentReport.student.study_hours_per_week} hrs/wk
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="text-[11px] text-slate-500">Assignments</div>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {studentReport.student.assignments_completion_rate}%
                </div>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <div className="text-[11px] text-indigo-700 font-semibold">Cumulative Marks</div>
                <div className="text-xl font-extrabold text-indigo-700 mt-0.5">
                  {studentReport.student.final_marks}%
                </div>
              </div>
            </div>
          </div>

          {/* Peer & Cohort Benchmark Comparison */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Peer Cohort Comparison ({studentReport.peer_comparison.peer_count} peers in {studentReport.student.department}, Sem {studentReport.student.semester})
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Department Average Marks: </span>
                <span className="font-bold text-slate-800">{studentReport.peer_comparison.dept_avg_marks}%</span>
                <span className={`ml-2 font-semibold ${studentReport.peer_comparison.marks_delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ({studentReport.peer_comparison.marks_delta >= 0 ? `+${studentReport.peer_comparison.marks_delta}` : studentReport.peer_comparison.marks_delta}%)
                </span>
              </div>
              <div>
                <span className="text-slate-500">Department Average Attendance: </span>
                <span className="font-bold text-slate-800">{studentReport.peer_comparison.dept_avg_attendance}%</span>
                <span className={`ml-2 font-semibold ${studentReport.peer_comparison.attendance_delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ({studentReport.peer_comparison.attendance_delta >= 0 ? `+${studentReport.peer_comparison.attendance_delta}` : studentReport.peer_comparison.attendance_delta}%)
                </span>
              </div>
            </div>
          </div>

          {/* Machine Learning & Risk Diagnostics */}
          <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Predictive Classification & Model Inference</span>
              </span>
              <span className="font-bold text-slate-700">
                Tier: <span className="text-indigo-700 font-extrabold">{studentReport.student.performance_category}</span>
              </span>
            </div>
            <div className="text-slate-600">
              Machine Learning projected expected marks: <span className="font-bold text-indigo-900">{studentReport.student.predicted_marks || studentReport.student.final_marks}%</span> with {((studentReport.student.prediction_confidence || 0.85) * 100).toFixed(0)}% confidence score.
            </div>
            {studentReport.student.at_risk && (
              <div className="text-rose-700 font-semibold pt-1">
                ⚠️ Student flagged At-Risk ({studentReport.student.risk_level} Priority). Contributing reasons: {studentReport.student.risk_factors.join(', ')}.
              </div>
            )}
          </div>

          {/* Prescribed Action Plan for Student */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Prescribed Interventions & Next Steps
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              {studentReport.recommendations.recommendations.map((r, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-500">
            <div>
              <div className="font-semibold text-slate-800">Faculty Academic Mentor</div>
              <div className="text-[11px] text-slate-400 mt-4">Authorized Signature & Stamp</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-800">Head of Academic Affairs</div>
              <div className="text-[11px] text-slate-400 mt-4">Verified Office Seal</div>
            </div>
          </div>
        </div>
      ) : reportType === 'class' && classSummary ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cohort Summary: {classDept} {classSem > 0 ? `(Semester ${classSem})` : ''}
              </h3>
              <p className="text-xs text-slate-500">
                Aggregated performance analysis covering {classSummary.total_students} students
              </p>
            </div>
            <a
              href={api.getExportCsvUrl()}
              download="cohort_summary.csv"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 cursor-pointer no-print"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cohort CSV</span>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Class Average</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{classSummary.average_marks}%</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl">
              <div className="text-slate-500">Pass Rate</div>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{classSummary.pass_rate}%</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl">
              <div className="text-slate-500">High Performers</div>
              <div className="text-xl font-bold text-indigo-600 mt-0.5">{classSummary.high_count}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl">
              <div className="text-slate-500">At-Risk Count</div>
              <div className="text-xl font-bold text-rose-600 mt-0.5">{classSummary.at_risk_count}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Department & Sem</th>
                  <th className="py-2.5 px-3 text-center">Attendance</th>
                  <th className="py-2.5 px-3 text-center">Marks</th>
                  <th className="py-2.5 px-3 text-center">Category</th>
                  <th className="py-2.5 px-3 text-center">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classSummary.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{s.student_id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3">{s.department} (Sem {s.semester})</td>
                    <td className="py-2.5 px-3 text-center">{s.attendance_rate}%</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{s.final_marks}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.performance_category === 'High' ? 'bg-emerald-100 text-emerald-800' : s.performance_category === 'Average' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.performance_category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {s.at_risk ? (
                        <span className="text-rose-600 font-bold text-[11px]">⚠️ {s.risk_level}</span>
                      ) : (
                        <span className="text-emerald-600 font-medium text-[11px]">Safe</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
