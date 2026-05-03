export type RiskBand = 'Low' | 'Moderate' | 'High' | 'Critical';
export type ConfidenceBand = 'High' | 'Moderate' | 'Low';

export interface RiskSubScore {
  category: string;
  score: number; // 0-100
  label: RiskBand;
  factors: string[];
}

export interface PropertyRiskResult {
  totalScore: number; // 0-100
  band: RiskBand;
  subScores: RiskSubScore[];
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  missingData: string[];
  evaluatedAt: string;
}
