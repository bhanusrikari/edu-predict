import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { StudentsList } from './pages/StudentsList';
import { DataMiningAnalysis } from './pages/DataMiningAnalysis';
import { MachineLearning } from './pages/MachineLearning';
import { AtRiskStudents } from './pages/AtRiskStudents';
import { Recommendations } from './pages/Recommendations';
import { Reports } from './pages/Reports';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedReportStudentId, setSelectedReportStudentId] = useState<number | null>(null);
  const [selectedRecStudentId, setSelectedRecStudentId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-300 text-sm font-medium">Initializing EduPredict Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleNavigateToReport = (studentId: number) => {
    setSelectedReportStudentId(studentId);
    setCurrentTab('reports');
  };

  const handleNavigateToRec = (studentId: number) => {
    setSelectedRecStudentId(studentId);
    setCurrentTab('recommendations');
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === 'dashboard' && <Dashboard onNavigateTab={setCurrentTab} />}
      {currentTab === 'students' && (
        <StudentsList
          onSelectStudentForReport={handleNavigateToReport}
          onSelectStudentForRec={handleNavigateToRec}
        />
      )}
      {currentTab === 'data-mining' && <DataMiningAnalysis />}
      {currentTab === 'ml-models' && <MachineLearning />}
      {currentTab === 'at-risk' && (
        <AtRiskStudents
          onSelectStudentForRec={handleNavigateToRec}
          onSelectStudentForReport={handleNavigateToReport}
        />
      )}
      {currentTab === 'recommendations' && (
        <Recommendations initialStudentId={selectedRecStudentId} />
      )}
      {currentTab === 'reports' && (
        <Reports initialStudentId={selectedReportStudentId} />
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
