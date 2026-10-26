import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Student, AtRiskSummary } from '../types';
import {
  AlertTriangle,
  UserCheck,
  Filter,
  ArrowRight,
  TrendingDown,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface AtRiskStudentsProps {
  onSelectStudentForRec: (studentId: number) => void;
  onSelectStudentForReport: (studentId: number) => void;
}

export const AtRiskStudents: React.FC<AtRiskStudentsProps> = ({
  onSelectStudentForRec,
  onSelectStudentForReport,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<AtRiskSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentList, sum] = await Promise.all([
        api.getAtRiskStudents(selectedRiskLevel, selectedDept),
        api.getAtRiskSummary(),
      ]);
      setStudents(studentList);
      setSummary(sum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRiskLevel, selectedDept]);

  return (
    <div className="space-y-6">
      {/* Risk Metrics Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold uppercase text-slate-400">Total Flagged Students</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total_at_risk}</div>
            <div className="text-xs text-slate-500 mt-1">Identified across all semesters</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
            <div className="text-xs font-semibold uppercase text-rose-700">High Risk Tier</div>
            <div className="text-2xl font-bold text-rose-700 mt-1">{summary.high_risk_count}</div>
            <div className="text-xs text-rose-600 mt-1">Immediate intervention needed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
            <div className="text-xs font-semibold uppercase text-amber-700">Medium Risk Tier</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{summary.medium_risk_count}</div>
            <div className="text-xs text-amber-600 mt-1">Needs regular monitoring</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold uppercase text-slate-400">Low / Emerging Risk</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{summary.low_risk_count}</div>
            <div className="text-xs text-slate-500 mt-1">Mild attendance/hours drops</div>
          </div>
        </div>
      )}

      {/* Common Contributing Factors Row */}
      {summary && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-indigo-600" />
            <span>Root-Cause Distribution of Student Risk Triggers</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {summary.factor_breakdown.map((item) => (
              <div key={item.factor} className="p-3 bg-slate-50 rounded-xl text-center">
                <div className="text-lg font-bold text-slate-800">{item.count}</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight mt-1">{item.factor}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-700 text-xs font-semibold uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter At-Risk Cohort:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Comm">Electronics & Comm</option>
            <option value="Mechanical Eng">Mechanical Eng</option>
            <option value="Civil Eng">Civil Eng</option>
          </select>
        </div>
      </div>

      {/* At-Risk Students Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          Scanning academic records for risk signatures...
        </div>
      ) : students.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No students currently matching the selected risk filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => {
            const factors: string[] = student.risk_factors ? JSON.parse(student.risk_factors) : [];
            const isHigh = student.risk_level === 'High';

            return (
              <div
                key={student.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isHigh ? 'border-rose-200 hover:shadow-md' : 'border-slate-200/80 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{student.risk_level} Risk</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{student.student_id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {student.department} • Semester {student.semester}
                  </p>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center mb-4 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Attendance</div>
                      <div className={`font-bold ${student.attendance_rate < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {student.attendance_rate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Study / Wk</div>
                      <div className="font-bold text-slate-800">{student.study_hours_per_week} hrs</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Marks</div>
                      <div className="font-bold text-slate-800">
                        {student.final_marks !== null ? `${student.final_marks}%` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Specific Contributing Factors */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Flagged Indicators
                    </div>
                    <div className="space-y-1 mb-4">
                      {factors.map((f, i) => (
                        <div
                          key={i}
                          className="text-[11px] text-rose-700 bg-rose-50/70 px-2 py-1 rounded-lg flex items-center space-x-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectStudentForReport(student.id)}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Academic Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onSelectStudentForRec(student.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Intervention Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
