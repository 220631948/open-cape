export interface ComparableRental {
  id: string;
  monthlyRent: number;
  propertyType?: string;
  bedrooms?: number;
  areaSqm?: number;
  date: string;
  distanceMeter: number;
}

export type RentalConfidenceCategory = 'High' | 'Moderate' | 'Low';

export interface RentalEstimateResult {
  estimatedMonthlyRent: number | null;
  estimationMethod: string;
  confidenceScore: number | null;
  confidenceCategory: RentalConfidenceCategory | null;
  estimationTimestamp: string;
  dataSources: string[];
}
