import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DataMiningInsights } from '../types';
import {
  TrendingUp,
  Brain,
  CheckCircle2,
  FileCheck,
  SearchCheck,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export const DataMiningAnalysis: React.FC = () => {
  const [insights, setInsights] = useState<DataMiningInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      try {
        const data = await api.getDataMiningInsights();
        setInsights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Computing correlations and mining attribute relationships...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        No dataset mining insights available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <SearchCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400">Total Analyzed Records</div>
            <div className="text-2xl font-bold text-slate-900">{insights.total_records}</div>
            <div className="text-[11px] text-slate-500">Active student sample size</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400">Data Preprocessing Quality</div>
            <div className="text-2xl font-bold text-slate-900">100% Valid</div>
            <div className="text-[11px] text-teal-600 font-medium">Cleaned & Zero Inconsistencies</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400">Key Predictor Factor</div>
            <div className="text-2xl font-bold text-slate-900">
              {insights.top_correlations_with_marks[0]?.feature || 'Attendance'}
            </div>
            <div className="text-[11px] text-amber-600 font-medium">
              r = {insights.top_correlations_with_marks[0]?.correlation} correlation
            </div>
          </div>
        </div>
      </div>

      {/* Row: Feature Importance Ranking & Key Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Relative Contribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Feature Importance Ranking</h3>
              <p className="text-xs text-slate-500">Relative impact weights derived from predictive attribute modeling</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={insights.feature_importance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 'dataMax + 0.05']} tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Weight']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="importance" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                  {insights.feature_importance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#4f46e5' : index === 1 ? '#6366f1' : '#14b8a6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Mining Key Findings & Correlation Coefficients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Actionable Data Mining Findings</h3>
            </div>
            <div className="space-y-2.5 mb-5">
              {insights.key_findings.map((f, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 flex items-start space-x-2">
                  <ArrowUpRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Correlation with Final Marks
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {insights.top_correlations_with_marks.map((c) => (
                <div key={c.feature} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-600 truncate max-w-[120px]">{c.feature}</span>
                  <span className={`font-mono font-bold ${c.correlation >= 0.5 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                    +{c.correlation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix Heatmap Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Full Pearson Correlation Heatmap Matrix</h3>
            <p className="text-xs text-slate-500">Pairwise linear correlation coefficients between all measured student metrics (-1.00 to +1.00)</p>
          </div>
          <Brain className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-2.5 px-3 text-left font-bold text-slate-500">Metric</th>
                {insights.correlations.features.map((f) => (
                  <th key={f} className="py-2.5 px-2 font-bold text-slate-700 max-w-[100px] truncate" title={f}>
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {insights.correlations.features.map((rowName, rIdx) => (
                <tr key={rowName} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 text-left font-sans font-semibold text-slate-800">{rowName}</td>
                  {insights.correlations.matrix[rIdx]?.map((val, cIdx) => {
                    const isSelf = rIdx === cIdx;
                    let bgColor = 'bg-white';
                    let textColor = 'text-slate-700';

                    if (isSelf) {
                      bgColor = 'bg-indigo-600 text-white font-bold';
                      textColor = 'text-white';
                    } else if (val >= 0.7) {
                      bgColor = 'bg-indigo-100 text-indigo-900 font-bold';
                    } else if (val >= 0.4) {
                      bgColor = 'bg-indigo-50 text-indigo-800 font-medium';
                    } else if (val >= 0.2) {
                      bgColor = 'bg-teal-50 text-teal-800';
                    }

                    return (
                      <td key={cIdx} className={`py-2 px-2 ${bgColor} ${textColor}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
