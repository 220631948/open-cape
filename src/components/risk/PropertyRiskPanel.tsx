import React from 'react';
import { PropertyRiskResult, RiskBand } from '../../types/risk';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ConfidenceScoreBadge } from '../valuation/ConfidenceScoreBadge';

interface Props {
  risk: PropertyRiskResult;
  className?: string;
}

export const PropertyRiskPanel: React.FC<Props> = ({ risk, className }) => {
  const getBandStyles = (band: RiskBand) => {
    switch (band) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className={cn("bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4", className)}>
      <div className="flex justify-between flex-wrap gap-2 mb-2">
        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3" /> Area Risk Profile
        </span>
        <ConfidenceScoreBadge 
          score={risk.confidenceScore} 
          category={risk.confidenceBand} 
        />
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="text-3xl font-black text-surface-900 leading-none">{risk.totalScore}</div>
        <div className={cn("px-2 py-0.5 rounded border text-xs font-bold uppercase mb-0.5", getBandStyles(risk.band))}>
          {risk.band} Risk
        </div>
      </div>

      <div className="space-y-3">
        {risk.subScores.map(sub => (
          <div key={sub.category} className="bg-white border border-surface-100 rounded p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-surface-800">{sub.category}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase", getBandStyles(sub.label))}>
                 {sub.label}
              </span>
            </div>
            {sub.factors.map((f, i) => (
              <p key={i} className="text-[10px] text-surface-500 flex items-start gap-1 mt-0.5">
                <span className="text-surface-300 mt-0.5">•</span> {f}
              </p>
            ))}
          </div>
        ))}
      </div>

      {risk.missingData.length > 0 && (
         <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded flex gap-2">
           <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
           <div>
             <p className="text-[10px] font-bold text-slate-600 uppercase">Missing Data</p>
             <p className="text-[10px] text-slate-500">
               {risk.missingData.join(', ')} unavailable for this location.
             </p>
           </div>
         </div>
      )}

      {risk.band === 'High' || risk.band === 'Critical' ? (
         <div className="mt-3 p-2 bg-red-50/50 border border-red-100 rounded flex gap-2">
           <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
           <p className="text-[10px] text-red-700">
             This property exhibits elevated risk factors. Comprehensive professional assessment is advised before development or transaction.
           </p>
         </div>
      ) : null}
      
      <p className="text-[9px] text-surface-400 mt-3 pt-3 border-t border-surface-200">
        This is an automated scoring based on available spatial data (e.g. flood areas, zoning). It does not substitute professional environmental or engineering assessments.
      </p>
    </div>
  );
};
