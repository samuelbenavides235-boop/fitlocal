import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`bg-charcoal-900/95 border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/25 ${className}`}
  >
    {children}
  </div>
);

export const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        {title}
      </h1>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: string;
  subvalue?: string;
  icon: React.ReactNode;
  accent?: boolean;
}> = ({ label, value, subvalue, icon, accent = false }) => (
  <Card
    className={
      accent
        ? 'border-lime-400/40 bg-gradient-to-br from-charcoal-900 to-charcoal-800'
        : ''
    }
  >
    <div className="flex items-start justify-between">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div
          className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
            accent ? 'text-lime-400' : 'text-white'
          }`}
        >
          {value}
        </div>
        {subvalue && <p className="text-xs text-slate-400 mt-1">{subvalue}</p>}
      </div>
      <div
        className={`p-2.5 rounded-xl ${
          accent
            ? 'bg-lime-400/15 text-lime-400'
            : 'bg-charcoal-800 text-slate-300'
        }`}
      >
        {icon}
      </div>
    </div>
  </Card>
);

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'lime' | 'slate' | 'amber' | 'sky';
}> = ({ children, variant = 'slate' }) => {
  const styles = {
    lime: 'bg-lime-400/15 text-lime-300 border-lime-400/30',
    slate: 'bg-charcoal-800 text-slate-300 border-slate-700',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="border border-dashed border-slate-800 rounded-2xl p-8 text-center bg-charcoal-900/40">
    <Info className="w-10 h-10 text-lime-400 mx-auto mb-3 opacity-80" />
    <h3 className="text-base font-bold text-white">{title}</h3>
    <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-bold text-sm transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const DisclaimerBanner: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-charcoal-800/80 border border-slate-700/70 text-xs text-slate-300">
    <AlertCircle className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
    <span>{text}</span>
  </div>
);