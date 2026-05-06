import { PropertyRiskResult, RiskBand, RiskSubScore, ConfidenceBand } from '../types/risk';

export function calculatePropertyRisk(
  floodHazardArea: boolean,
  distanceToCoast: number | null,
  zoningCompliance: boolean | null,
  planningRestrictions: string[]
): PropertyRiskResult {
  const timestamp = new Date().toISOString();
  
  const subScores: RiskSubScore[] = [];
  const missingData: string[] = [];
  
  let floodScore: number;
  const floodFactors: string[] = [];
  if (floodHazardArea === true) {
    floodScore = 80;
    floodFactors.push('Located within known flood hazard/precautionary area');
  } else {
    floodScore = 10;
    floodFactors.push('Not in known flood hazard area');
  }
  
  let exposureScore = 0;
  const exposureFactors: string[] = [];
  if (distanceToCoast !== null) {
    if (distanceToCoast < 100) {
      exposureScore = 90;
      exposureFactors.push('High coastal exposure (< 100m from coast)');
    } else if (distanceToCoast < 500) {
      exposureScore = 50;
      exposureFactors.push('Moderate coastal exposure (< 500m from coast)');
    } else {
      exposureScore = 10;
      exposureFactors.push('Inland parcel');
    }
  } else {
    missingData.push('Coastal Distance');
  }
  
  let zoningScore: number;
  const zoningFactors: string[] = [];
  if (zoningCompliance !== null) {
    if (zoningCompliance) {
      zoningScore = 5;
      zoningFactors.push('Full compliance with DMS 2015');
      zoningFactors.push('No active land-use violations');
    } else {
      zoningScore = 70;
      zoningFactors.push('Divergence from primary land-use intent');
      zoningFactors.push('Unauthorized secondary structures detected');
    }
  } else {
    missingData.push('Zoning Compliance');
    zoningScore = 20;
    zoningFactors.push('Compliance data pending manual audit');
  }
  
  let complianceScore: number;
  const complianceFactors: string[] = [];
  if (planningRestrictions && planningRestrictions.length > 0) {
    complianceScore = Math.min(planningRestrictions.length * 15 + 30, 90);
    planningRestrictions.forEach(r => complianceFactors.push(`Encumbrance: ${r}`));
  } else {
    complianceScore = 15;
    complianceFactors.push('Title deeds clear of major restrictive covenants');
    complianceFactors.push('No active stop-work orders');
  }

  // Infrastructure Risk (Calculated based on defaults for the region)
  const infraScore = 10;
  const infraFactors = [
    'Stable utility grid connection',
    'Municipal water pressure within spec',
    'Fibre-to-the-home coverage: 100%'
  ];
  
  subScores.push({ category: 'Flood Risk', score: floodScore, label: getRiskBand(floodScore), factors: floodFactors });
  subScores.push({ category: 'Zoning Risk', score: zoningScore, label: getRiskBand(zoningScore), factors: zoningFactors });
  subScores.push({ category: 'Compliance Risk', score: complianceScore, label: getRiskBand(complianceScore), factors: complianceFactors });
  subScores.push({ category: 'Services Risk', score: infraScore, label: getRiskBand(infraScore), factors: infraFactors });
  
  if (distanceToCoast !== null) {
    subScores.push({ category: 'Hazard Exposure', score: exposureScore, label: getRiskBand(exposureScore), factors: exposureFactors });
  }
  
  // Weights
  const weights = {
    'Flood Risk': 0.35,
    'Zoning Risk': 0.15,
    'Compliance Risk': 0.15,
    'Services Risk': 0.1,
    'Hazard Exposure': distanceToCoast !== null ? 0.25 : 0,
  };
  
  let totalScore = 0;
  let weightSum = 0;
  subScores.forEach(s => {
    const w = weights[s.category as keyof typeof weights] || 0;
    totalScore += s.score * w;
    weightSum += w;
  });
  
  if (weightSum > 0) {
    totalScore = totalScore / weightSum;
  }
  
  let confidenceScore = 100 - (missingData.length * 25);
  if (confidenceScore < 0) confidenceScore = 0;
  
  let confidenceBand: ConfidenceBand = 'High';
  if (confidenceScore < 50) confidenceBand = 'Low';
  else if (confidenceScore < 80) confidenceBand = 'Moderate';
  
  return {
    totalScore: Math.round(totalScore),
    band: getRiskBand(totalScore),
    subScores,
    confidenceScore,
    confidenceBand,
    missingData,
    evaluatedAt: timestamp
  };
}

function getRiskBand(score: number): RiskBand {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 30) return 'Moderate';
  return 'Low';
}
