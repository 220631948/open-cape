import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SourceRecord {
  id: string;
  sourceId: string;
  name: string;
  category: 'cadastre' | 'zoning' | 'contextual' | 'market' | 'registry' | 'imagery';
  websiteUrl: string;
  licenseNote: string;
  coverage: string;
  qualityBadge: string;
  retrievedAt?: any;
  verifiedAt?: any;
  isPublic: boolean;
  purposeDesc: string;
  verificationStatus?: 'verified-integration' | 'pending-integration' | 'metadata-only';
}

// Fallback seed data so the UI remains robust regardless of Firestore being seeded.
export const VERIFIED_SOURCES: SourceRecord[] = [
  {
    id: 'cct_open_data_portal',
    sourceId: 'cct_open_data_portal',
    name: 'City of Cape Town Open Data Portal',
    category: 'contextual',
    websiteUrl: 'https://odp.capetown.gov.za/',
    licenseNote: 'City of Cape Town Open Data License',
    coverage: 'Cape Town Metro',
    qualityBadge: 'Authoritative',
    isPublic: true,
    purposeDesc: 'Authoritative public municipal data catalog for spatial base layers.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'cct_zoning',
    sourceId: 'cct_zoning',
    name: 'City of Cape Town Zoning',
    category: 'zoning',
    websiteUrl: 'https://odp.capetown.gov.za/',
    licenseNote: 'City of Cape Town Open Data License',
    coverage: 'Cape Town Metro',
    qualityBadge: 'Authoritative',
    isPublic: true,
    purposeDesc: 'Zoning layer reference to determine permissible land uses.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'cct_land_parcels',
    sourceId: 'cct_land_parcels',
    name: 'City of Cape Town Land Parcels',
    category: 'cadastre',
    websiteUrl: 'https://odp.capetown.gov.za/',
    licenseNote: 'City of Cape Town Open Data License',
    coverage: 'Cape Town Metro',
    qualityBadge: 'Authoritative',
    isPublic: true,
    purposeDesc: 'Cadastre/parcel layer reference for geographical boundaries.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'osm_geofabrik_sa',
    sourceId: 'osm_geofabrik_sa',
    name: 'Geofabrik SA Extract',
    category: 'contextual',
    websiteUrl: 'https://download.geofabrik.de/africa/south-africa.html',
    licenseNote: 'Open Database License (ODbL)',
    coverage: 'South Africa',
    qualityBadge: 'Community Maintained',
    isPublic: true,
    purposeDesc: 'Open contextual basemap and geography source.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'nasa_gibs',
    sourceId: 'nasa_gibs',
    name: 'NASA GIBS Earthdata',
    category: 'imagery',
    websiteUrl: 'https://worldview.earthdata.nasa.gov/',
    licenseNote: 'Public Domain',
    coverage: 'Global',
    qualityBadge: 'Scientific / Analytical',
    isPublic: true,
    purposeDesc: 'Stable low-resolution satellite imagery for macro-level analysis.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'openaerialmap',
    sourceId: 'openaerialmap',
    name: 'OpenAerialMap Community Index',
    category: 'imagery',
    websiteUrl: 'https://openaerialmap.org/',
    licenseNote: 'CC-BY 4.0 / OdBL',
    coverage: 'Global (Patchy)',
    qualityBadge: 'Community Maintained',
    isPublic: true,
    purposeDesc: 'Open source aerial imagery contributed by community and drones.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'wcgp-cadastre',
    sourceId: 'wcgp-cadastre',
    name: 'Western Cape Government Open Data',
    category: 'cadastre',
    websiteUrl: 'https://westerncape.gov.za/',
    licenseNote: 'Western Cape Open Data License',
    coverage: 'Western Cape Province',
    qualityBadge: 'Authoritative',
    isPublic: true,
    purposeDesc: 'Province-wide cadastral and contextual layers.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'wcgp-zoning',
    sourceId: 'wcgp-zoning',
    name: 'Western Cape Zoning',
    category: 'zoning',
    websiteUrl: 'https://westerncape.gov.za/',
    licenseNote: 'Western Cape Open Data License',
    coverage: 'Western Cape Province',
    qualityBadge: 'Authoritative',
    isPublic: true,
    purposeDesc: 'Province-wide zoning information.',
    verificationStatus: 'verified-integration'
  },
  {
    id: 'deeds_registration',
    sourceId: 'deeds_registration',
    name: 'SA Deeds Registration',
    category: 'registry',
    websiteUrl: 'https://deeds.gov.za/',
    licenseNote: 'Official Registry / Regulated',
    coverage: 'South Africa',
    qualityBadge: 'Authoritative',
    isPublic: true,
    purposeDesc: 'Official registry reference for future lawful verification workflows.',
    verificationStatus: 'metadata-only'
  },
  {
    id: 'property24_property_data',
    sourceId: 'property24_property_data',
    name: 'Property24 Index',
    category: 'market',
    websiteUrl: 'https://www.property24.com/',
    licenseNote: 'Commercial License Required',
    coverage: 'South Africa',
    qualityBadge: 'Commercial / Reference',
    isPublic: false,
    purposeDesc: 'Commercial market-data reference for contextual analysis.',
    verificationStatus: 'metadata-only'
  },
  {
    id: 'property24_development_api',
    sourceId: 'property24_development_api',
    name: 'Property24 Dev Sandbox',
    category: 'market',
    websiteUrl: 'https://www.property24.com/',
    licenseNote: 'Commercial License Required',
    coverage: 'South Africa',
    qualityBadge: 'Sandbox Environment',
    isPublic: false,
    purposeDesc: 'Integration sandbox for commercial development API.',
    verificationStatus: 'pending-integration'
  }
];

export function useSourceCatalog() {
  const [sources, setSources] = useState<SourceRecord[]>(VERIFIED_SOURCES);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'source_catalog'));
      if (!snap.empty) {
         setSources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SourceRecord)));
      }
    } catch (err: any) {
      console.warn("Using fallback source layout. Firestore collection missing or empty:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const getSourceById = (id: string) => {
    return sources.find(s => s.sourceId === id || s.id === id);
  };

  return { sources, isLoading, fetchSources, getSourceById };
}
