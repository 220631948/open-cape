import React from 'react';
import { PropertyRiskResult, RiskBand } from '../../types/risk';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ConfidenceScoreBadge } from '../valuation/ConfidenceScoreBadge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

  const getBandColor = (band: RiskBand) => {
    switch (band) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Moderate': return '#d97706';
      case 'Low': return '#059669';
      default: return '#cbd5e1';
    }
  };

  // Setup gauge data (0-100 mapping)
  const score = Math.max(0, Math.min(100, risk.totalScore));
  const remainder = 100 - score;
  const data = [
    { name: 'Score', value: score, color: getBandColor(risk.band) },
    { name: 'Remaining', value: remainder, color: '#f1f5f9' }
  ];

  return (
    <div className={cn("bg-white p-6 rounded-xl border border-surface-200 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] uppercase font-black text-surface-400 tracking-[0.15em] flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-primary-500" /> 
          Risk Intelligence Profile
        </h3>
        <ConfidenceScoreBadge 
          score={risk.confidenceScore} 
          category={risk.confidenceBand} 
        />
      </div>

      <div className="flex flex-col items-center mb-8 relative">
        <div className="h-32 w-full -mb-12">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center z-10">
          <div className="text-3xl font-black text-surface-900 leading-none">{risk.totalScore}</div>
          <div className={cn("px-2 py-0.5 mt-1 rounded border text-xs font-bold uppercase", getBandStyles(risk.band))}>
            {risk.band} Risk
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-6">
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
         <div className="mt-4 p-3 bg-surface-50 border border-surface-100 rounded-lg flex gap-3">
           <Info className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
           <div>
             <p className="text-[10px] font-black text-surface-500 uppercase tracking-wider mb-0.5">Observation Gaps</p>
             <p className="text-[10px] text-surface-400 leading-tight">
               Primary metrics for <span className="font-medium text-surface-600">{risk.missingData.join(', ')}</span> are currently unverified for this precinct.
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
