import { useMemo } from 'react';
import { calculatePropertyRisk } from '../services/riskService';
import { PropertyRiskResult } from '../types/risk';

interface UsePropertyRiskProps {
  floodHazardArea: boolean;
  distanceToCoast: number | null;
  zoningCompliance: boolean | null;
  planningRestrictions: string[];
  disabled?: boolean;
}

export function usePropertyRisk({
  floodHazardArea,
  distanceToCoast,
  zoningCompliance,
  planningRestrictions,
  disabled = false
}: UsePropertyRiskProps): PropertyRiskResult | null {
  
  const riskResult = useMemo(() => {
    if (disabled) return null;
    return calculatePropertyRisk(
      floodHazardArea,
      distanceToCoast,
      zoningCompliance,
      planningRestrictions
    );
  }, [
    floodHazardArea,
    distanceToCoast,
    zoningCompliance,
    JSON.stringify(planningRestrictions),
    disabled
  ]);

  return riskResult;
}
