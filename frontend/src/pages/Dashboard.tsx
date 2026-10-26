import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  DashboardSummary,
  CategoryDistribution,
  AttendanceMarksPoint,
  SubjectSemesterPerformance,
  DepartmentPerformance,
} from '../types';
import { StatCard } from '../components/StatCard';
import {
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  Clock,
  BookOpen,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  High: '#10b981', // emerald
  Average: '#f59e0b', // amber
  Low: '#ef4444', // rose
};

export const Dashboard: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [distribution, setDistribution] = useState<CategoryDistribution[]>([]);
  const [scatterData, setScatterData] = useState<AttendanceMarksPoint[]>([]);
  const [semData, setSemData] = useState<SubjectSemesterPerformance[]>([]);
  const [deptData, setDeptData] = useState<DepartmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, dist, scatter, sem, dept] = await Promise.all([
        api.getDashboardSummary(),
        api.getCategoryDistribution(),
        api.getAttendanceVsMarks(),
        api.getSemesterPerformance(),
        api.getDepartmentPerformance(),
      ]);
      setSummary(sum);
      setDistribution(dist);
      setScatterData(scatter);
      setSemData(sem);
      setDeptData(dept);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered scatter points
  const filteredScatter = scatterData.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading academic analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <h4 className="font-semibold text-base mb-1">Failed to load analytics</h4>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2 text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold uppercase tracking-wider">Analysis Filters:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {deptData.map((d) => (
              <option key={d.department} value={d.department}>
                {d.department}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="High">High Performers (≥ 75%)</option>
            <option value="Average">Average Performers (50-74%)</option>
            <option value="Low">Low Performers (&lt; 50%)</option>
          </select>

          <button
            onClick={fetchData}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={summary.total_students}
            subtitle={`${summary.avg_attendance}% overall attendance`}
            icon={Users}
            color="navy"
          />
          <StatCard
            title="Average Marks"
            value={`${summary.average_marks}%`}
            subtitle="Across all coursework & tests"
            icon={Award}
            color="indigo"
          />
          <StatCard
            title="Pass Rate"
            value={`${summary.pass_percentage}%`}
            subtitle="Threshold: ≥ 50% cumulative"
            icon={TrendingUp}
            color="teal"
          />
          <div
            onClick={() => onNavigateTab && onNavigateTab('at-risk')}
            className="cursor-pointer"
          >
            <StatCard
              title="At-Risk Students"
              value={summary.at_risk_count}
              subtitle="Require early intervention"
              icon={AlertTriangle}
              color="rose"
            />
          </div>
        </div>
      )}

      {/* Row 2: Performance Distribution & Attendance vs Marks Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Performance Distribution</h3>
              <span className="text-[11px] font-medium text-slate-400">Classified Cohort</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {distribution.map((entry) => (
                      <Cell
                        key={`cell-${entry.category}`}
                        fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} students`, `${name} Tier`]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            {distribution.map((d) => (
              <div key={d.category} className="p-2 rounded-xl bg-slate-50">
                <div className="text-xs font-semibold text-slate-500">{d.category}</div>
                <div className="text-base font-bold text-slate-800">{d.count}</div>
                <div className="text-[11px] text-slate-400">{d.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance vs Marks Scatter Plot */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attendance vs Final Marks Analysis</h3>
              <p className="text-xs text-slate-500">
                Visualizing correlation between class presence and overall mark achievement
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">High</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-600">Average</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">Low</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="attendance_rate"
                  name="Attendance"
                  unit="%"
                  domain={[30, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Attendance Rate (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="marks"
                  name="Final Marks"
                  unit="%"
                  domain={[20, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Marks (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                />
                <ZAxis range={[40, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as AttendanceMarksPoint;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1">
                          <p className="font-bold text-slate-800">{data.name} ({data.student_id})</p>
                          <p className="text-slate-600">Attendance: <span className="font-semibold text-indigo-600">{data.attendance_rate}%</span></p>
                          <p className="text-slate-600">Marks: <span className="font-semibold text-emerald-600">{data.marks}%</span></p>
                          <p className="text-slate-600">Performance: <span className="font-semibold">{data.category}</span></p>
                          {data.at_risk && <p className="text-rose-600 font-bold">⚠️ Flagged At-Risk</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={filteredScatter}
                  fill="#6366f1"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const fill = CATEGORY_COLORS[payload.category] || '#6366f1';
                    return <circle cx={cx} cy={cy} r={5} fill={fill} fillOpacity={0.8} stroke="#ffffff" strokeWidth={1} />;
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Semester-wise Performance & Department Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester-wise Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Semester-wise Marks & Attendance</h3>
              <p className="text-xs text-slate-500">Average academic trends across Semesters 1 through 8</p>
            </div>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semester" tick={{ fontSize: 11 }} tickFormatter={(s) => `Sem ${s}`} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => [`${val}%`]}
                />
                <Bar dataKey="average_marks" name="Average Marks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="average_attendance" name="Average Attendance" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Department Performance Benchmark</h3>
              <p className="text-xs text-slate-500">Comparative pass rates and at-risk density by branch</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Students</th>
                  <th className="py-2.5 px-3 text-right">Avg Marks</th>
                  <th className="py-2.5 px-3 text-right">Pass Rate</th>
                  <th className="py-2.5 px-3 text-right">At-Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deptData.map((d) => (
                  <tr key={d.department} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{d.department}</td>
                    <td className="py-2.5 px-3 text-right">{d.total_students}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-indigo-600">
                      {d.average_marks}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                      {d.pass_rate}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        d.at_risk_count > 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.at_risk_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
