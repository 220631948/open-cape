import { ValuationResult } from './valuation';
import { PropertyRiskResult } from './risk';
import { PriceForecastResult } from './forecast';
import { RentalEstimateResult } from './rental';
import { MarketSegmentResult } from './segment';

export interface PropertyData {
  id: string; // Document ID (usually erf number or internal ID)
  erfNumber?: string;
  address?: string;
  location?: { lat: number; lng: number };
  tenantId?: string; // For multi-tenancy
  
  // Model Outputs
  valuation?: ValuationResult;
  risk?: PropertyRiskResult;
  forecast?: PriceForecastResult;
  rental?: RentalEstimateResult;
  segmentation?: MarketSegmentResult;

  // Metadata
  lastUpdated: string | Date;
  status: 'active' | 'archived';
  propertyType?: string;
}
