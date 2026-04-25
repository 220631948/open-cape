export type SourceCategory = 
  | 'cadastre' 
  | 'zoning' 
  | 'open-contextual' 
  | 'analytical-imagery' 
  | 'authoritative-registry' 
  | 'commercial-market';

export type SourceHealth = 'healthy' | 'degraded' | 'offline';
export type SourceStatus = 'live' | 'pending-integration' | 'metadata-only' | 'failed';

export interface SourceUserMessage {
  type: 'info' | 'warning' | 'error';
  text: string;
}

export interface MapSourceContract {
  id: string;
  label: string;
  category: SourceCategory;
  status: SourceStatus;
  health: SourceHealth;
  
  // MapLibre Specifics
  mapLibreSource: any | null; // Null if no live map source
  mapLibreLayers: any[];      // Array of layer definitions
  
  // Metadata
  license: string;
  attribution: string;
  coverage: string;
  
  // Capabilities
  isRenderable: boolean;
  isQueryable: boolean;
  
  // Dynamic Messaging
  userMessages: SourceUserMessage[];
}
