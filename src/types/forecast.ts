export type TrendDirection = 'Increasing' | 'Stable' | 'Decreasing' | 'Highly Volatile';

export interface ForecastDataPoint {
  year: number;
  value: number;
  isHistorical: boolean;
}

export interface PriceForecastResult {
  forecastValue1Year: number;
  forecastValue3Year: number;
  forecastValue5Year: number;
  forecastConfidence: number; // 0-100
  trendDirection: TrendDirection;
  historicalData: ForecastDataPoint[];
  forecastData: ForecastDataPoint[];
  method: string;
  evaluatedAt: string;
  growthRate: number;
}
