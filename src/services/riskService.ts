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
      zoningFactors.push('Appears compliant with zoning');
    } else {
      zoningScore = 70;
      zoningFactors.push('Potential zoning non-compliance detected');
    }
  } else {
    missingData.push('Zoning Compliance');
    zoningScore = 20; // Default unknown
    zoningFactors.push('Zoning compliance data unavailable');
  }
  
  let complianceScore: number;
  const complianceFactors: string[] = [];
  if (planningRestrictions && planningRestrictions.length > 0) {
    complianceScore = Math.min(planningRestrictions.length * 20 + 30, 90);
    planningRestrictions.forEach(r => complianceFactors.push(`Restriction: ${r}`));
  } else {
    complianceScore = 10;
    complianceFactors.push('No known severe restrictions');
  }
  
  subScores.push({ category: 'Flood Risk', score: floodScore, label: getRiskBand(floodScore), factors: floodFactors });
  subScores.push({ category: 'Zoning Risk', score: zoningScore, label: getRiskBand(zoningScore), factors: zoningFactors });
  subScores.push({ category: 'Compliance Risk', score: complianceScore, label: getRiskBand(complianceScore), factors: complianceFactors });
  if (distanceToCoast !== null) {
    subScores.push({ category: 'Hazard Exposure', score: exposureScore, label: getRiskBand(exposureScore), factors: exposureFactors });
  }
  
  // Weights
  const weights = {
    'Flood Risk': 0.4,
    'Zoning Risk': 0.2,
    'Compliance Risk': 0.2,
    'Hazard Exposure': distanceToCoast !== null ? 0.2 : 0,
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
