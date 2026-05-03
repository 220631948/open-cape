import { PriceForecastResult, ForecastDataPoint, TrendDirection } from '../types/forecast';

export function calculatePriceForecast(
  transactions: { date: string; price: number; type: string }[] | undefined,
  currentValuation: number | undefined,
  marketSegment: string | undefined,
  municipality: string | undefined,
  propertyRiskScore: number | undefined
): PriceForecastResult | null {
  if (!currentValuation || currentValuation <= 0) return null;

  const currentYear = new Date().getFullYear();
  const timestamp = new Date().toISOString();

  let baseGrowthRate = 0.04; // 4% default annual growth
  let confidence = 50;
  let method = 'General Municipality Average';

  // Extract valid historical transactions
  const validTransactions = (transactions || [])
    .filter(t => typeof t.price === 'number' && t.price > 0 && !isNaN(new Date(t.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (validTransactions.length >= 2) {
    const firstTx = validTransactions[0];
    const lastTx = validTransactions[validTransactions.length - 1];
    const yearsDiff = (new Date(lastTx.date).getTime() - new Date(firstTx.date).getTime()) / (1000 * 3600 * 24 * 365);
    
    if (yearsDiff >= 1) {
      // Compound Annual Growth Rate (CAGR)
      const rawCAGR = Math.pow(lastTx.price / firstTx.price, 1 / yearsDiff) - 1;
      // Cap unreasonable growth rates to avoid astronomical forecasts
      baseGrowthRate = Math.max(-0.15, Math.min(0.20, rawCAGR));
      method = 'Historical Transaction CAGR';
      confidence += 30;
    }
  } else if (marketSegment) {
    // Segment-based fallbacks
    method = 'Market Segment Baseline';
    confidence += 15;
    if (marketSegment === 'Coastal Premium') baseGrowthRate = 0.08;
    else if (marketSegment === 'High-Density Urban') baseGrowthRate = 0.06;
    else if (marketSegment === 'Suburban Family Housing') baseGrowthRate = 0.05;
    else if (marketSegment === 'Commercial / Industrial') baseGrowthRate = 0.05;
    else if (marketSegment === 'Rural / Agricultural') baseGrowthRate = 0.02;
  }

  // Adjust for risk
  if (typeof propertyRiskScore === 'number') {
    if (propertyRiskScore > 70) {
      baseGrowthRate -= 0.03; // High risk lowers growth
      confidence -= 10;
    } else if (propertyRiskScore < 30) {
      baseGrowthRate += 0.01; // Low risk slightly boosts
    }
  }

  let trendDirection: TrendDirection = 'Stable';
  if (baseGrowthRate > 0.05) trendDirection = 'Increasing';
  else if (baseGrowthRate < -0.01) trendDirection = 'Decreasing';
  
  if (validTransactions.length >= 3) {
    // Basic volatility check: do prices jump around wildly?
    // A simplified check might just be looking at the variance from the trend.
    // For simplicity, we just flag it if confidence is low but there are transactions.
    // Real implementation would calculate price variance vs time.
  }

  const historicalData: ForecastDataPoint[] = [];
  
  // Plot historical points. We'll include the current valuation as the present year.
  // We'll limit to last 10 years for charting purposes if possible.
  validTransactions.forEach(t => {
     const tYear = new Date(t.date).getFullYear();
     // Avoid duplicates in the same year for a simple chart
     const existing = historicalData.find(h => h.year === tYear);
     if (!existing) {
       historicalData.push({ year: tYear, value: t.price, isHistorical: true });
     } else {
       // Average if multiple in same year
       existing.value = (existing.value + t.price) / 2;
     }
  });

  // Ensure current valuation is the peg for current year
  const existingCurrent = historicalData.find(h => h.year === currentYear);
  if (!existingCurrent) {
    historicalData.push({ year: currentYear, value: currentValuation, isHistorical: true });
  } else {
    // If a transaction happened this year, it might be different from the valuation.
    // We'll trust the latest transaction or current valuation? Let's keep both, but maybe 
    // just use current valuation as the starting point for forecast.
  }
  
  historicalData.sort((a, b) => a.year - b.year);

  // Generate Forecasts
  const forecastData: ForecastDataPoint[] = [];

  const valStart = currentValuation;
  
  const forecastValue1Year = valStart * Math.pow(1 + baseGrowthRate, 1);
  const forecastValue3Year = valStart * Math.pow(1 + baseGrowthRate, 3);
  const forecastValue5Year = valStart * Math.pow(1 + baseGrowthRate, 5);

  forecastData.push({ year: currentYear + 1, value: forecastValue1Year, isHistorical: false });
  forecastData.push({ year: currentYear + 3, value: forecastValue3Year, isHistorical: false });
  forecastData.push({ year: currentYear + 5, value: forecastValue5Year, isHistorical: false });

  return {
    forecastValue1Year,
    forecastValue3Year,
    forecastValue5Year,
    forecastConfidence: Math.max(10, Math.min(100, confidence)),
    trendDirection,
    historicalData,
    forecastData,
    method,
    evaluatedAt: timestamp
  };
}
