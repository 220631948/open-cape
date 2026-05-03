import { useMemo } from 'react';
import { detectTransactionAnomalies } from '../services/anomalyService';
import { TransactionAnomalyResult } from '../types/anomaly';

interface UseTransactionAnomaliesProps {
  transactionHistory?: { date: string; price: number; type: string }[];
  localComparableMedianPrice?: number;
  disabled?: boolean;
}

export function useTransactionAnomalies({
  transactionHistory,
  localComparableMedianPrice,
  disabled
}: UseTransactionAnomaliesProps): TransactionAnomalyResult | null {
  return useMemo(() => {
    if (disabled) return null;
    return detectTransactionAnomalies(transactionHistory || [], localComparableMedianPrice);
  }, [
    JSON.stringify(transactionHistory), // Use stringify for array deep compare on primitive properties
    localComparableMedianPrice,
    disabled
  ]);
}
