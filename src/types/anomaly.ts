export type AnomalySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AnomalyReason {
  code: string;
  description: string;
}

export interface TransactionAnomalyResult {
  score: number; // 0-100
  severity: AnomalySeverity;
  reasons: AnomalyReason[];
  confidence: number; // 0-100
  evaluatedAt: string;
}
