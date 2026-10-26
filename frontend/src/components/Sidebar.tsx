import React from 'react';
import {
  LayoutDashboard,
  Users,
  LineChart,
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'data-mining', label: 'Data Mining & Analysis', icon: LineChart },
    { id: 'ml-models', label: 'Machine Learning', icon: BrainCircuit },
    { id: 'at-risk', label: 'At-Risk Detection', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'reports', label: 'Academic Reports', icon: FileSpreadsheet },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-white tracking-tight text-base font-sans">
                  EduPredict
                </span>
                <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
                  Analytics & ML
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Threshold Note */}
      {!collapsed && (
        <div className="p-4 m-3 bg-slate-800/50 rounded-xl border border-slate-800 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">Thresholds</div>
          <div className="flex justify-between py-0.5">
            <span className="text-emerald-400 font-medium">High</span>
            <span>≥ 75%</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-amber-400 font-medium">Average</span>
            <span>50% - 74%</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-rose-400 font-medium">Low</span>
            <span>&lt; 50%</span>
          </div>
        </div>
      )}
    </aside>
  );
};
