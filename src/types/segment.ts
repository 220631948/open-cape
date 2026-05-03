export type MarketSegment = 
  | 'High-Density Urban'
  | 'Suburban Family Housing'
  | 'Coastal Premium'
  | 'Mixed-Use Corridor'
  | 'Commercial / Industrial'
  | 'Peri-Urban'
  | 'Rural / Agricultural'
  | 'Uncategorized';

export interface SegmentDriver {
  feature: string;
  impact: string;
}

export interface MarketSegmentResult {
  segment: MarketSegment;
  confidence: number; // 0-100
  drivers: SegmentDriver[];
  topComparableCluster: string;
  evaluatedAt: string;
}
