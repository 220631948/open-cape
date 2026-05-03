import { useMemo } from 'react';
import { determineMarketSegment } from '../services/segmentService';
import { MarketSegmentResult } from '../types/segment';

interface UseMarketSegmentsProps {
  areaSqm?: number;
  zoning?: string;
  distanceToCoast?: number | null;
  valuation?: number;
  municipality?: string;
  disabled?: boolean;
}

export function useMarketSegments({
  areaSqm,
  zoning,
  distanceToCoast,
  valuation,
  municipality,
  disabled
}: UseMarketSegmentsProps): MarketSegmentResult | null {
  return useMemo(() => {
    if (disabled) return null;
    return determineMarketSegment(areaSqm, zoning, distanceToCoast, valuation, municipality);
  }, [
    areaSqm,
    zoning,
    distanceToCoast,
    valuation,
    municipality,
    disabled
  ]);
}
