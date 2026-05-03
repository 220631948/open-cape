import React from 'react';
import { RentalEstimateResult } from '../../types/rental';
import { ConfidenceScoreBadge } from '../valuation/ConfidenceScoreBadge';
import { Landmark } from 'lucide-react';

interface Props {
  estimate: RentalEstimateResult;
}

export const RentalEstimatePanel: React.FC<Props> = ({ estimate }) => {
  return (
    <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
          <Landmark className="h-3 w-3" /> Estimated Monthly Rent
        </span>
        <ConfidenceScoreBadge 
          score={estimate.confidenceScore} 
          category={estimate.confidenceCategory} 
        />
      </div>
      
      {estimate.estimatedMonthlyRent !== null ? (
        <p className="text-xl font-bold text-surface-900">R {estimate.estimatedMonthlyRent.toLocaleString()}/mo</p>
      ) : (
        <p className="text-sm font-medium text-surface-500">{estimate.estimationMethod || 'Estimated value unavailable'}</p>
      )}

      {estimate.estimatedMonthlyRent !== null && (
        <>
          <p className="text-[10px] text-surface-500 mt-2">
            This value is automatically calculated using locally available signals and/or municipal valuation derivations.
            It is an indicative estimate only and not an official or guaranteed rental value.
          </p>
          <div className="text-[10px] text-surface-400 font-medium mt-3 border-t border-surface-200 pt-2 grid grid-cols-2 gap-2">
            <div>
              <span className="block opacity-75">Method</span>
              <span className="text-surface-600 block truncate">{estimate.estimationMethod}</span>
            </div>
            <div>
              <span className="block opacity-75">Sources</span>
              <span className="text-surface-600 block truncate">{estimate.dataSources.join(', ') || 'None'}</span>
            </div>
            <div className="col-span-2">
              <span className="block opacity-75">Generated</span>
              <span className="text-surface-600">{new Date(estimate.estimationTimestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
