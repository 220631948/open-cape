import { useMemo } from 'react';
import { calculatePriceForecast } from '../services/forecastService';
import { PriceForecastResult } from '../types/forecast';

interface UsePriceForecastProps {
  transactions?: { date: string; price: number; type: string }[];
  currentValuation?: number;
  marketSegment?: string;
  municipality?: string;
  propertyRiskScore?: number;
  disabled?: boolean;
}

export function usePriceForecast({
  transactions,
  currentValuation,
  marketSegment,
  municipality,
  propertyRiskScore,
  disabled
}: UsePriceForecastProps): PriceForecastResult | null {
  return useMemo(() => {
    if (disabled || !currentValuation) return null;
    return calculatePriceForecast(
      transactions,
      currentValuation,
      marketSegment,
      municipality,
      propertyRiskScore
    );
  }, [transactions, currentValuation, marketSegment, municipality, propertyRiskScore, disabled]);
}
