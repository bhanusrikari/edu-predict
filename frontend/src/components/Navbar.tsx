import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Analytics Dashboard',
    subtitle: 'Institutional student performance metrics, trends, and risk distributions',
  },
  students: {
    title: 'Student Records Directory',
    subtitle: 'Manage, search, filter, and import student academic histories',
  },
  'data-mining': {
    title: 'Data Mining & Correlation Analysis',
    subtitle: 'Exploratory data analysis, attribute relationships, and predictive indicators',
  },
  'ml-models': {
    title: 'Machine Learning Engine',
    subtitle: 'Logistic Regression, Decision Tree & Random Forest evaluation & real-time inference',
  },
  'at-risk': {
    title: 'Early At-Risk Detection Center',
    subtitle: 'Targeted identification of students requiring immediate academic intervention',
  },
  recommendations: {
    title: 'Personalized Academic Advisor',
    subtitle: 'AI-generated intervention plans, revision modules, and faculty mentoring workflows',
  },
  reports: {
    title: 'Performance Reports & Exports',
    subtitle: 'Exportable transcripts, class distributions, and print-ready dossiers',
  },
};

export const Navbar: React.FC<NavbarProps> = ({ currentTab }) => {
  const { user, logout } = useAuth();
  const info = tabTitles[currentTab] || { title: 'Academic Portal', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{info.title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">{info.subtitle}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            ML Engine Online
          </span>
        </div>

        {/* User Profile */}
        {user && (
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user.full_name}
              </div>
              <div className="text-[11px] text-slate-500 uppercase font-mono tracking-wider">
                {user.role}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              <UserCheck className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
