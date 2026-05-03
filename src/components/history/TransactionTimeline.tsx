import React from 'react';
import { cn } from '../../lib/utils';
import { CircleDollarSign, ArrowRightLeft } from 'lucide-react';
import { TransactionEvent } from '../../types/history';

export interface TransactionTimelineProps {
  transactions: TransactionEvent[];
  className?: string;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactions, className }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className={cn("text-xs text-surface-500 py-4 text-center border-t border-surface-200 border-dashed", className)}>
        No transaction history available
      </div>
    );
  }

  // Filter and sort by latest first
  const sorted = transactions
    .filter(t => !isNaN(new Date(t.date).getTime()) && typeof t.price === 'number')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return (
      <div className={cn("text-xs text-surface-500 py-4 text-center border-t border-surface-200 border-dashed", className)}>
        No valid transaction history available
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-[10px] text-surface-500 mb-2">This timeline shows recorded property transfers and sale events.</p>
      <div className="relative border-l-2 border-surface-200 ml-3 space-y-6 pb-2">
        {sorted.map((t, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
              {t.type.toLowerCase().includes('sale') ? (
                <CircleDollarSign className="h-2.5 w-2.5 text-emerald-600" />
              ) : (
                <ArrowRightLeft className="h-2.5 w-2.5 text-blue-600" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                {new Date(t.date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold text-surface-900">R {t.price.toLocaleString()}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 text-surface-600 border border-surface-200 font-medium">
                  {t.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
