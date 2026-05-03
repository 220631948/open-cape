export interface ComparableSale {
  id: string;
  price: number;
  areaSqm: number;
  date: string;
  distanceMeter: number;
}

export type ConfidenceCategory = 'High' | 'Moderate' | 'Low';

export interface ValuationResult {
  estimatedValue: number | null;
  valuationMethod: string;
  confidenceScore: number | null;
  confidenceCategory: ConfidenceCategory | null;
  valuationTimestamp: string;
}
