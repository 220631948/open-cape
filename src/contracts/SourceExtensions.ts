import { MapSourceContract } from './MapSourceContract';

export interface AerialImageryContract extends MapSourceContract {
  category: 'open-contextual' | 'analytical-imagery';
  resolution?: string;
  acquisitionDate?: string;
}

export interface RegistryReferenceContract extends MapSourceContract {
  category: 'authoritative-registry';
  registryId?: string;
}

export interface CommercialMarketContract extends MapSourceContract {
  category: 'commercial-market';
  apiTier?: 'free' | 'premium' | 'enterprise';
}
