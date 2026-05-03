import { ComparableRental, RentalEstimateResult, RentalConfidenceCategory } from '../types/rental';

export function calculateRentalEstimate(
  parcelAreaSqm?: number,
  zoning?: string,
  municipality?: string,
  propertyType?: string,
  bedrooms?: number,
  recentRentalsNearby?: ComparableRental[],
  municipalValuation?: number
): RentalEstimateResult {
  const timestamp = new Date().toISOString();

  let estimatedRent: number | null = null;
  let method: string;
  let score = 0;
  const sources: string[] = [];

  // Algorithm configuration
  const validRentals = (recentRentalsNearby || []).filter(r => r.monthlyRent > 0);

  if (validRentals.length > 0) {
    // Basic Comparable Similarity Scoring
    // Ideally we filter by propertyType, bedrooms, area similarity here
    const sortedRentals = validRentals.slice().sort((a, b) => a.monthlyRent - b.monthlyRent);
    // Use median for now
    estimatedRent = sortedRentals[Math.floor(sortedRentals.length / 2)].monthlyRent;
    method = 'Comparable Rentals Model';
    sources.push('Local Rental Listings');

    const dataVolumeScore = Math.min((validRentals.length / 5) * 40, 40);
    // Proxy scores
    const recencyScore = 20; 
    const distanceScore = 20;
    const similarityScore = (propertyType || bedrooms) ? 15 : 5;
    
    score = Math.round(dataVolumeScore + recencyScore + distanceScore + similarityScore);

  } else if (municipalValuation && municipalValuation > 0) {
    // Yield-based estimate fallback
    // e.g. 7% gross yield roughly, divided by 12 months
    const assumedYieldPercentage = 0.07;
    estimatedRent = Math.round((municipalValuation * assumedYieldPercentage) / 12);
    method = 'Valuation-roll Yield Proxy';
    sources.push('Municipal Valuation Roll');
    
    score = 45; // Low confidence
  } else {
    method = 'Estimate not available';
  }

  let category: RentalConfidenceCategory | null = null;
  if (score >= 80) category = 'High';
  else if (score >= 50) category = 'Moderate';
  else if (score > 0) category = 'Low';

  return {
    estimatedMonthlyRent: estimatedRent,
    estimationMethod: method,
    confidenceScore: score > 0 ? score : null,
    confidenceCategory: category,
    estimationTimestamp: timestamp,
    dataSources: sources
  };
}
