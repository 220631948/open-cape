export interface TransactionEvent {
  date: string;
  price: number;
  type: string;
  titleDeedNumber?: string;
  ownershipChange?: boolean;
}

export interface ValuationTrend {
  year: string;
  value: number;
  source: string;
}

export interface OwnershipChangeEvent {
  detected: boolean;
  previousOwnerType?: string;
  newOwnerType?: string;
  previousOwnerCategory?: string;
  newOwnerCategory?: string;
  transferDate?: string;
  eventType?: 'Sale' | 'Inheritance' | 'Subdivision' | 'Consolidation' | 'Transfer';
}
