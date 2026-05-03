import React from 'react';
import { ConfidenceCategory } from '../../types/valuation';
import { cn } from '../../lib/utils';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface Props {
  score: number | null;
  category: ConfidenceCategory | null;
}

export const ConfidenceScoreBadge: React.FC<Props> = ({ score, category }) => {
  if (score === null || category === null) return null;

  const bgStyles = {
    High: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-red-50 text-red-700 border-red-200'
  };

  const Icons = {
    High: ShieldCheck,
    Moderate: Shield,
    Low: ShieldAlert
  };

  const Icon = Icons[category];

  return (
    <div className="group relative">
      <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase", bgStyles[category])}>
        <Icon className="w-3 h-3" />
        <span>{category} ({score}%)</span>
      </div>
      <div className="absolute top-full right-0 mt-1 w-48 bg-surface-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        This score indicates how reliable the estimated property value is based on available data.
      </div>
    </div>
  );
};
