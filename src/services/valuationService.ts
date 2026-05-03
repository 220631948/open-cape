import { ComparableSale, ValuationResult, ConfidenceCategory } from '../types/valuation';

export function calculatePropertyValuation(
  parcelAreaSqm: number | undefined,
  zoning: string | undefined,
  municipality: string | undefined,
  recentSalesNearby: ComparableSale[] | undefined,
  landValue: number | undefined,
  improvementValue: number | undefined
): ValuationResult {
  const timestamp = new Date().toISOString();

  // Base fallback
  let estimatedValue: number | null = null;
  let method = 'Insufficient Data';
  let score = 0;
  
  if (recentSalesNearby && recentSalesNearby.length > 0 && parcelAreaSqm && parcelAreaSqm > 0) {
    // 1. Comparable Sales Model
    const validSales = recentSalesNearby.filter(s => s.price > 0 && s.areaSqm > 0);
    if (validSales.length > 0) {
      const pricesPerSqm = validSales.map(s => s.price / s.areaSqm).sort((a, b) => a - b);
      const medianPricePerSqm = pricesPerSqm[Math.floor(pricesPerSqm.length / 2)];
      
      estimatedValue = medianPricePerSqm * parcelAreaSqm;
      method = 'Comparable Sales Model';
      
      // Calculate confidence 0-100
      const dataVolumeScore = Math.min((validSales.length / 5) * 40, 40); // 5+ sales = 40%
      const recencyScore = 25; // simplified, normally calculated on dates
      const distanceScore = 20; // simplified, normally computed on distance
      const similarityScore = 15; // simplified
      score = Math.round(dataVolumeScore + recencyScore + distanceScore + (similarityScore * 0.5));
    }
  } 

  if (!estimatedValue && landValue) {
    // Fallback Municipal
    estimatedValue = landValue + (improvementValue || 0);
    method = 'Municipal Valuation Roll';
    score = 50; 
  } else if (!estimatedValue) {
    method = 'Estimated value not available';
  }
  
  // Categorize
  let category: ConfidenceCategory | null = null;
  if (score >= 80) category = 'High';
  else if (score >= 50) category = 'Moderate';
  else if (score > 0) category = 'Low';

  return {
    estimatedValue,
    valuationMethod: method,
    confidenceScore: score > 0 ? score : null,
    confidenceCategory: category,
    valuationTimestamp: timestamp
  };
}
