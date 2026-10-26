import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { RecommendationPlan, Student } from '../types';
import {
  Lightbulb,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
  Search,
  BookOpen,
  Award,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface RecommendationsProps {
  initialStudentId?: number | null;
}

export const Recommendations: React.FC<RecommendationsProps> = ({ initialStudentId }) => {
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(initialStudentId || null);
  const [plan, setPlan] = useState<RecommendationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load students for selector
  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await api.getStudents({ page: 1, pageSize: 200 });
        setStudentsList(data.items);
        if (!selectedStudentId && data.items.length > 0) {
          // Default to first student (preferably an at-risk student if exists)
          const atRisk = data.items.find((s) => s.at_risk);
          setSelectedStudentId(atRisk ? atRisk.id : data.items[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStudents();
  }, []);

  // Load recommendation plan whenever selectedStudentId changes
  useEffect(() => {
    if (!selectedStudentId) return;
    async function fetchPlan() {
      setLoading(true);
      try {
        const rec = await api.getRecommendations(selectedStudentId!);
        setPlan(rec);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [selectedStudentId]);

  const filteredStudents = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Personalized Academic Advisor & Interventions</h2>
          <p className="text-xs text-slate-500">
            Generate customized academic recovery, remedial revision, and mentoring roadmaps
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Select Student:
          </label>
          <select
            value={selectedStudentId || ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
          >
            {studentsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.student_id}) {s.at_risk ? '⚠️ At-Risk' : `[${s.performance_category}]`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          Synthesizing personalized academic recommendations...
        </div>
      ) : plan ? (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-indigo-300 text-xs font-medium mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Academic Consultation Report</span>
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-xs text-slate-300 mt-1 font-mono">{plan.student_id}</p>
                <p className="text-sm text-slate-200 mt-2">{plan.summary}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 text-right">
                <span className="text-xs text-slate-400">Total Action Items</span>
                <span className="text-3xl font-extrabold text-white mt-1">
                  {plan.action_plan.length}
                </span>
              </div>
            </div>
          </div>

          {/* Core Recommendations List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Targeted Remedial & Growth Directives</span>
            </h4>
            <div className="space-y-2.5">
              {plan.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Structured Action Plan Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              <span>Structured Weekly Academic Action Plan</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Focus Area</th>
                    <th className="py-3 px-4">Prescribed Intervention Action</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4 text-right">Target Timeframe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {plan.action_plan.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.area}
                      </td>
                      <td className="py-3 px-4 leading-relaxed max-w-md">
                        {item.action}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            item.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : item.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-500 whitespace-nowrap">
                        {item.timeframe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Faculty Interventions & Mentoring Notes */}
          {plan.interventions.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-amber-700" />
                <span>Faculty Advisor & Institutional Interventions</span>
              </h4>
              <p className="text-xs text-amber-700 mb-3">
                Mandatory steps for class coordinator or assigned academic mentor:
              </p>
              <div className="space-y-1.5">
                {plan.interventions.map((inv, idx) => (
                  <div key={idx} className="text-xs text-amber-900 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    <span>{inv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
