import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'indigo' | 'teal' | 'amber' | 'rose' | 'navy';
}

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-50/70 text-indigo-600 border-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
  },
  teal: {
    bg: 'bg-teal-50/70 text-teal-600 border-teal-100',
    iconBg: 'bg-teal-600 text-white',
  },
  amber: {
    bg: 'bg-amber-50/70 text-amber-600 border-amber-100',
    iconBg: 'bg-amber-600 text-white',
  },
  rose: {
    bg: 'bg-rose-50/70 text-rose-600 border-rose-100',
    iconBg: 'bg-rose-600 text-white',
  },
  navy: {
    bg: 'bg-slate-100 text-navy-800 border-slate-200',
    iconBg: 'bg-navy-800 text-white',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
}) => {
  const currentStyle = colorStyles[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl shadow-inner ${currentStyle.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-400 ml-1.5">vs departmental baseline</span>
        </div>
      )}
    </div>
  );
};
