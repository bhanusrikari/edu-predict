import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ModelMetric, SinglePredictionResponse, TrainModelResponse } from '../types';
import {
  BrainCircuit,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle,
  Sparkles,
  BarChart,
  HelpCircle,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

export const MachineLearning: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [testSplit, setTestSplit] = useState(0.2);
  const [trainResultMsg, setTrainResultMsg] = useState<string | null>(null);

  // Single Prediction Form
  const [predForm, setPredForm] = useState({
    attendance_rate: 82.0,
    study_hours_per_week: 18.0,
    assignments_completion_rate: 90.0,
    internal_marks: 75.0,
    mid_term_marks: 78.0,
    previous_semester_marks: 80.0,
    model_name: 'random_forest',
  });
  const [predicting, setPredicting] = useState(false);
  const [singleResult, setSingleResult] = useState<SinglePredictionResponse | null>(null);

  // Batch Predict state
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [batchMsg, setBatchMsg] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getModelMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleTrainModels = async () => {
    setTraining(true);
    setTrainResultMsg(null);
    try {
      const res: TrainModelResponse = await api.trainModels(testSplit);
      setTrainResultMsg(
        `✅ ${res.message} Best Model: ${res.best_model.replace('_', ' ').toUpperCase()} (Evaluated on ${res.test_size} hold-out test samples)`
      );
      await loadMetrics();
    } catch (err: any) {
      setTrainResultMsg(`❌ Training error: ${err.message}`);
    } finally {
      setTraining(false);
    }
  };

  const handlePredictSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await api.predictSingle(predForm);
      setSingleResult(res);
    } catch (err: any) {
      alert(`Prediction failed: ${err.message}`);
    } finally {
      setPredicting(false);
    }
  };

  const handleBatchPredict = async () => {
    setBatchUpdating(true);
    setBatchMsg(null);
    try {
      const res = await api.batchPredict(predForm.model_name);
      setBatchMsg(`✅ ${res.message}`);
    } catch (err: any) {
      setBatchMsg(`❌ Batch prediction error: ${err.message}`);
    } finally {
      setBatchUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Controls Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Machine Learning Training & Cross-Evaluation</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare Logistic Regression, Decision Tree, and Random Forest using rigorous train/test splitting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold">Test Partition:</span>
            <select
              value={testSplit}
              onChange={(e) => setTestSplit(Number(e.target.value))}
              className="bg-transparent font-mono font-bold text-indigo-600 focus:outline-none"
            >
              <option value={0.15}>15% Test</option>
              <option value={0.20}>20% Test (Recommended)</option>
              <option value={0.25}>25% Test</option>
              <option value={0.30}>30% Test</option>
            </select>
          </div>

          <button
            onClick={handleTrainModels}
            disabled={training}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${training ? 'animate-spin' : ''}`} />
            <span>{training ? 'Training Models...' : 'Retrain All Models'}</span>
          </button>

          <button
            onClick={handleBatchPredict}
            disabled={batchUpdating}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Activity className={`w-3.5 h-3.5 text-indigo-600 ${batchUpdating ? 'animate-spin' : ''}`} />
            <span>{batchUpdating ? 'Scoring...' : 'Score All Students'}</span>
          </button>
        </div>
      </div>

      {trainResultMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs border ${
            trainResultMsg.startsWith('✅')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {trainResultMsg}
        </div>
      )}

      {batchMsg && (
        <div className="p-3.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl text-xs">
          {batchMsg}
        </div>
      )}

      {/* Model Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metrics.map((m) => {
          const isBest = m.is_active;
          return (
            <div
              key={m.model_name}
              className={`bg-white rounded-2xl border p-5 shadow-xs relative transition-all ${
                isBest ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200/80'
              }`}
            >
              {isBest && (
                <div className="absolute top-3.5 right-3.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>ACTIVE / BEST</span>
                </div>
              )}

              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Classifier
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-4">{m.display_name}</h3>

              <div className="grid grid-cols-2 gap-2.5 text-center mb-5">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                  <div className="text-lg font-bold text-slate-900">
                    {(m.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">F1-Score</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {(m.f1_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Precision</div>
                  <div className="text-sm font-bold text-slate-800">
                    {(m.precision * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Recall</div>
                  <div className="text-sm font-bold text-slate-800">
                    {(m.recall * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Confusion Matrix Mini-Grid */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Confusion Matrix</span>
                  <span className="text-[10px] text-slate-400 font-normal">Pred: High / Avg / Low</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
                  {m.confusion_matrix.map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`p-1.5 rounded-lg text-xs font-bold ${
                          rIdx === cIdx
                            ? 'bg-emerald-100 text-emerald-800'
                            : val > 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                        title={`Actual: ${m.classes[rIdx]}, Pred: ${m.classes[cIdx]}`}
                      >
                        {val}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Interactive Prediction Playground */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-6">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Real-Time Performance Prediction
            </h3>
            <p className="text-xs text-slate-500">
              Simulate individual academic inputs and immediately generate classified tier, expected marks, and interventions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <form onSubmit={handlePredictSingle} className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Model Engine
                </label>
                <select
                  value={predForm.model_name}
                  onChange={(e) => setPredForm({ ...predForm, model_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="random_forest">Random Forest Classifier (Ensemble)</option>
                  <option value="logistic_regression">Logistic Regression (Linear)</option>
                  <option value="decision_tree">Decision Tree Classifier (Rule-based)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Attendance Rate</label>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {predForm.attendance_rate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={predForm.attendance_rate}
                  onChange={(e) =>
                    setPredForm({ ...predForm, attendance_rate: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Study Hours / Week</label>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {predForm.study_hours_per_week} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="45"
                  step="1"
                  value={predForm.study_hours_per_week}
                  onChange={(e) =>
                    setPredForm({ ...predForm, study_hours_per_week: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Assignments Rate</label>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {predForm.assignments_completion_rate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={predForm.assignments_completion_rate}
                  onChange={(e) =>
                    setPredForm({ ...predForm, assignments_completion_rate: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Marks (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={predForm.internal_marks}
                  onChange={(e) => setPredForm({ ...predForm, internal_marks: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Midterm Marks (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={predForm.mid_term_marks}
                  onChange={(e) => setPredForm({ ...predForm, mid_term_marks: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Sem Marks</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={predForm.previous_semester_marks}
                  onChange={(e) => setPredForm({ ...predForm, previous_semester_marks: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={predicting}
              className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>{predicting ? 'Computing Inference...' : 'Generate Prediction'}</span>
            </button>
          </form>

          {/* Results Display */}
          <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
            {singleResult ? (
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Predicted Classification Tier
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span
                      className={`text-2xl font-black ${
                        singleResult.predicted_category === 'High'
                          ? 'text-emerald-600'
                          : singleResult.predicted_category === 'Average'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {singleResult.predicted_category} Performance
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full font-mono">
                      {(singleResult.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Expected Marks (Regressor):</span>
                    <span className="font-bold text-base text-indigo-700">
                      {singleResult.predicted_marks}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-slate-500 font-medium">Risk Assessment:</span>
                    <span
                      className={`font-bold ${
                        singleResult.risk_assessment === 'High'
                          ? 'text-rose-600'
                          : singleResult.risk_assessment === 'Medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {singleResult.risk_assessment} Risk
                    </span>
                  </div>
                </div>

                {/* Class Probabilities */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">Class Probabilities</div>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(singleResult.category_probabilities).map(([cat, prob]) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <span className="w-16 font-medium text-slate-600">{cat}:</span>
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cat === 'High' ? 'bg-emerald-500' : cat === 'Average' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${prob * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-mono text-[11px] text-slate-500">
                          {(prob * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Tailored Action Item</div>
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    {singleResult.recommendations[0]}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Cpu className="w-10 h-10 mb-2 text-indigo-300" />
                <p className="text-xs font-medium text-slate-600">No active prediction yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Adjust sliders on the left and click "Generate Prediction" to see real-time machine learning inference
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
