import { TransactionEvent, ValuationTrend } from '../types/history';

export function getTransactionHistory(featureHistory: any[]): TransactionEvent[] {
  if (!featureHistory || featureHistory.length === 0) return [];
  
  return featureHistory.map(h => ({
    date: h.date,
    price: h.price,
    type: h.type,
    titleDeedNumber: h.titleDeedNumber,
    ownershipChange: h.ownershipChange,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getValuationTrends(history: any[]): ValuationTrend[] {
  if (!history || history.length === 0) return [];
  return history.map(h => ({
    year: h.year,
    value: h.value,
    source: h.source
  })).sort((a, b) => Number(a.year) - Number(b.year));
}
