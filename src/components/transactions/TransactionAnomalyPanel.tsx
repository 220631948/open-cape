import React from 'react';
import { TransactionAnomalyResult, AnomalySeverity } from '../../types/anomaly';
import { ActivitySquare, AlertOctagon, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ConfidenceScoreBadge } from '../valuation/ConfidenceScoreBadge';

interface Props {
  anomaly: TransactionAnomalyResult;
  className?: string;
}

export const TransactionAnomalyPanel: React.FC<Props> = ({ anomaly, className }) => {
  const getSeverityStyles = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getSeverityIcon = (severity: AnomalySeverity) => {
    if (severity === 'Critical' || severity === 'High') {
      return <AlertOctagon className="w-5 h-5 text-red-500" />;
    }
    return <ActivitySquare className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className={cn("bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
          <ActivitySquare className="h-3 w-3" /> Transaction Screening
        </span>
        <ConfidenceScoreBadge 
          score={anomaly.confidence} 
          category={anomaly.confidence >= 80 ? 'High' : anomaly.confidence >= 50 ? 'Moderate' : 'Low'} 
        />
      </div>

      <div className="flex items-center gap-3 mb-4">
        {getSeverityIcon(anomaly.severity)}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-surface-900 leading-none">Unusual Pattern Detected</span>
          </div>
          <p className="text-[10px] text-surface-500 mt-0.5">Automated algorithmic flag based on record history.</p>
        </div>
        <div className={cn("ml-auto px-2 py-1 rounded border text-[10px] font-bold uppercase", getSeverityStyles(anomaly.severity))}>
          {anomaly.severity} Priority
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {anomaly.reasons.map((r) => (
          <div key={r.code} className="bg-white border border-surface-200 rounded p-2.5 flex items-start gap-2 shadow-sm">
            <div className="mt-0.5">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-800">{r.code.replace(/_/g, ' ')}</p>
              <p className="text-[10px] text-surface-500 mt-0.5 leading-relaxed">{r.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded flex gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong className="block text-slate-600 mb-0.5">Automated Screening Notification</strong>
          These flags indicate statistical or temporal anomalies in the cadastral/transaction dataset. They do not constitute proof of irregularity or fraud, and are intended solely to assist in prioritizing manual file reviews.
        </p>
      </div>

      <div className="mt-3 pt-2 pl-1 border-t border-surface-200 flex justify-between items-center">
         <span className="text-[9px] text-surface-400">Score: {anomaly.score}/100</span>
         <span className="text-[9px] text-surface-400">{new Date(anomaly.evaluatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};
