import { useMemo } from 'react';
import { calculateRentalEstimate } from '../services/rentalService';
import { ComparableRental, RentalEstimateResult } from '../types/rental';

interface UseRentalEstimateProps {
  parcelAreaSqm?: number;
  zoning?: string;
  municipality?: string;
  propertyType?: string;
  bedrooms?: number;
  recentRentalsNearby?: ComparableRental[];
  municipalValuation?: number;
  disabled?: boolean;
}

export function useRentalEstimate({
  parcelAreaSqm,
  zoning,
  municipality,
  propertyType,
  bedrooms,
  recentRentalsNearby,
  municipalValuation,
  disabled = false
}: UseRentalEstimateProps): RentalEstimateResult | null {
  
  const estimate = useMemo(() => {
    if (disabled) return null;
    
    return calculateRentalEstimate(
      parcelAreaSqm,
      zoning,
      municipality,
      propertyType,
      bedrooms,
      recentRentalsNearby,
      municipalValuation
    );
  }, [
    parcelAreaSqm,
    zoning,
    municipality,
    propertyType,
    bedrooms,
    JSON.stringify(recentRentalsNearby || []), 
    municipalValuation,
    disabled
  ]);

  return estimate;
}
