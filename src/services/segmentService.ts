import { MarketSegmentResult, MarketSegment, SegmentDriver } from '../types/segment';

export function determineMarketSegment(
  areaSqm?: number,
  zoning?: string,
  distanceToCoast?: number | null,
  valuation?: number,
  municipality?: string
): MarketSegmentResult {
  const timestamp = new Date().toISOString();
  
  if (!areaSqm && !zoning && !municipality) {
    return {
      segment: 'Uncategorized',
      confidence: 10,
      drivers: [{ feature: 'Missing Data', impact: 'Insufficient attributes for segmentation' }],
      topComparableCluster: 'Unknown',
      evaluatedAt: timestamp
    };
  }

  let segment: MarketSegment;
  let confidence: number;
  const drivers: SegmentDriver[] = [];
  let cluster = 'General Municipal';

  const isCoastal = typeof distanceToCoast === 'number' && distanceToCoast < 1500;
  const isLarge = areaSqm && areaSqm > 10000;
  const isSmall = areaSqm && areaSqm < 400;
  const isCommercial = zoning && (zoning.toLowerCase().includes('commer') || zoning.toLowerCase().includes('indus') || zoning.toLowerCase().includes('busin'));
  const isMixedUse = zoning && (zoning.toLowerCase().includes('mixed') || zoning.toLowerCase().includes('mu'));
  const isAgri = zoning && (zoning.toLowerCase().includes('agri') || zoning.toLowerCase().includes('rural'));

  if (isCoastal && valuation && valuation > 3000000) {
    segment = 'Coastal Premium';
    confidence = 85;
    drivers.push({ feature: 'Proximity to Coast', impact: 'Less than 1.5km from coastline' });
    drivers.push({ feature: 'Valuation', impact: 'High municipal or estimated valuation' });
    cluster = 'Beachfront & Coastal Estate';
  } else if (isAgri || (isLarge && !isCommercial)) {
    segment = areaSqm && areaSqm > 50000 ? 'Rural / Agricultural' : 'Peri-Urban';
    confidence = 80;
    drivers.push({ feature: 'Zoning/Size', impact: isAgri ? 'Agricultural zoning' : 'Large parcel size indicative of peri-urban/rural' });
    cluster = 'Farms & Smallholdings';
  } else if (isCommercial) {
    segment = 'Commercial / Industrial';
    confidence = 90;
    drivers.push({ feature: 'Zoning', impact: 'Zoned for commercial, retail, or industrial use' });
    cluster = 'Business Parks & Corridors';
  } else if (isMixedUse) {
    segment = 'Mixed-Use Corridor';
    confidence = 85;
    drivers.push({ feature: 'Zoning', impact: 'Mixed-use zoning classification' });
    cluster = 'Urban Arterial';
  } else if (isSmall) {
    segment = 'High-Density Urban';
    confidence = 75;
    drivers.push({ feature: 'Parcel Size', impact: 'Compact footprint (< 400sqm)' });
    cluster = 'Townhouses & Urban Infill';
  } else if (areaSqm && areaSqm >= 400 && areaSqm <= 2000) {
    segment = 'Suburban Family Housing';
    confidence = 80;
    drivers.push({ feature: 'Parcel Size', impact: 'Standard residential scale (400-2000sqm)' });
    cluster = 'Established Suburbia';
  } else {
    segment = 'Suburban Family Housing'; // Default fallback for mid-sized
    confidence = 40;
    drivers.push({ feature: 'Fallback', impact: 'Defaulted based on general municipal average' });
  }

  if (municipality) {
     cluster = `${cluster} - ${municipality}`;
  }

  // Adjust confidence based on available data
  if (!zoning) confidence -= 20;
  if (!areaSqm) confidence -= 20;
  if (!valuation) confidence -= 10;

  return {
    segment,
    confidence: Math.max(10, Math.min(100, confidence)),
    drivers,
    topComparableCluster: cluster,
    evaluatedAt: timestamp
  };
}
