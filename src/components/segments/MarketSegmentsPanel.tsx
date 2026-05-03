import React from 'react';
import { MarketSegmentResult } from '../../types/segment';
import { PieChart, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ConfidenceScoreBadge } from '../valuation/ConfidenceScoreBadge';

interface Props {
  segmentation: MarketSegmentResult;
  className?: string;
}

export const MarketSegmentsPanel: React.FC<Props> = ({ segmentation, className }) => {
  return (
    <div className={cn("bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
          <PieChart className="h-3 w-3" /> Market Segmentation
        </span>
        <ConfidenceScoreBadge 
          score={segmentation.confidence} 
          category={segmentation.confidence >= 80 ? 'High' : segmentation.confidence >= 50 ? 'Moderate' : 'Low'} 
        />
      </div>

      <div className="mb-4">
        <div className="text-xl font-bold text-surface-900 leading-tight">
          {segmentation.segment}
        </div>
        <p className="text-[10px] text-surface-500 mt-1 uppercase font-semibold">
           Cluster: {segmentation.topComparableCluster}
        </p>
      </div>

      <div className="space-y-2 mb-3">
        {segmentation.drivers.map((d, i) => (
          <div key={i} className="bg-white border border-surface-100 rounded px-2.5 py-1.5 flex flex-col gap-0.5">
             <span className="text-[10px] font-bold text-surface-700">{d.feature}</span>
             <span className="text-[10px] text-surface-500 leading-tight">{d.impact}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded flex gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[9px] text-slate-500 leading-relaxed">
          Segments are algorithmically assigned using cadastral characteristics. Filtering the map or reports by this segment will yield highly comparable properties.
        </p>
      </div>
      
      <div className="mt-3 pt-2 pl-1 border-t border-surface-200 flex justify-end items-center">
         <span className="text-[9px] text-surface-400">{new Date(segmentation.evaluatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};
