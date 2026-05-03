import React from 'react';
import { ConfidenceScoreBadge } from './ConfidenceScoreBadge';
import { ValuationResult } from '../../types/valuation';

interface Props {
  valuation: ValuationResult;
}

export const EstimatedValuePanel: React.FC<Props> = ({ valuation }) => {
  return (
    <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Estimated Value (Approximate)</span>
        <ConfidenceScoreBadge score={valuation.confidenceScore} category={valuation.confidenceCategory} />
      </div>
      
      {valuation.estimatedValue !== null ? (
        <p className="text-xl font-bold text-surface-900">R {valuation.estimatedValue.toLocaleString()}</p>
      ) : (
        <p className="text-sm font-medium text-surface-500">{valuation.valuationMethod || 'Estimated value unavailable'}</p>
      )}

      {valuation.estimatedValue !== null && (
        <>
          <p className="text-[10px] text-surface-500 mt-2">
            This value is automatically calculated using nearby comparable sales and available municipal valuation data.
            It is an indicative estimate and not an official valuation.
          </p>
          <div className="flex justify-between items-center text-[10px] text-surface-400 font-medium mt-3 border-t border-surface-200 pt-2">
            <span>Method: {valuation.valuationMethod}</span>
            <span>Generated: {new Date(valuation.valuationTimestamp).toLocaleDateString()}</span>
          </div>
        </>
      )}
    </div>
  );
};
