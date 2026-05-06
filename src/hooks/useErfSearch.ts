import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { searchCCTParcels, getLiveErfRecordById } from '@/source_connectors/cctOpenDataClient';

export interface ErfRecord {
  id: string;
  objectId?: number;
  erfNumber: string;
  allotmentArea: string;
  portion?: string;
  zoning?: string;
  subZone?: string;
  zoningCategory?: string;
  address?: string | null;
  ownerName?: string;
  lastValuation?: number;
  center: { lat: number; lng: number };
  updatedAt?: any;
  status?: string;
  geometry?: any;
  parcelFeature?: any;
  zoningFeature?: any;
  properties?: any;
  provenance?: {
     sourceId: string;
     sourceName: string;
     recordId: string;
     geometryType: string;
     fetchedAt: string;
     verifiedAt: string | null;
     verificationStatus: string;
     displayMode: string;
  };

  // Pricing & AVM Enrichment
  askingPrice?: number | null;
  lastSalePrice?: number | null;
  lastSaleDate?: string | null;
  saleStatus?: string | null;
  
  valuationSource?: string | null;
  valuationYear?: string | number | null;
  landValue?: number | null;
  improvementValue?: number | null;
  
  estimatedValueAvm?: number | null;
  avmConfidenceScore?: number | 'High' | 'Medium' | 'Low' | null;
  pricePerSqm?: number | null;
  
  ownerType?: string | null;
  ownershipCategory?: string | null;
  lastOwnershipChangeDate?: string | null;
  
  transactionHistory?: { date: string; price: number; type: string }[];
  valuationHistory?: { year: string; value: number; source: string }[];

  // Property Risk Additions
  floodHazardArea?: boolean;
  distanceToCoast?: number | null;
  zoningCompliance?: boolean | null;
  planningRestrictions?: string[];
  propertyType?: string;
  bedrooms?: number;
  municipality?: string;
}

export function useErfSearch() {
  const [results, setResults] = useState<ErfRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the absolute latest full data for a single ERF by its ID.
   */
  const fetchErfDetails = async (erfId: string): Promise<ErfRecord | null> => {
    setIsSearching(true);
    setError(null);
    try {
      if (erfId.startsWith('geocode-')) {
        const cached = results.find(r => r.id === erfId);
        if (cached) return cached;
        return null; // Cannot refetch a geocode result without params
      }
      if (erfId.startsWith('cct-')) {
        const objectId = erfId.replace('cct-', '');
        return await getLiveErfRecordById(objectId);
      } else {
        const erfRef = doc(db, 'erfs', erfId);
        const snap = await getDoc(erfRef);
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as ErfRecord;
        }
      }
      return null;
    } catch (err: any) {
      console.error("Fetch details failed:", err);
      setError(err.message || "Failed to load ERF details.");
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const searchByErfNumber = async (erfNumber: string, allotmentArea?: string) => {
    if (!erfNumber) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Prioritize live open data layer search
      const liveData = await searchCCTParcels(erfNumber);
      if (liveData && liveData.features) {
         const parsed = liveData.features.map((f: any) => {
            const props = f.properties;
            let lat = 0, lng = 0;
            if (f.geometry?.type === 'Polygon') {
              lng = f.geometry.coordinates[0][0][0];
              lat = f.geometry.coordinates[0][0][1];
            }
            return {
               id: `cct-${props.OBJECTID}`,
               erfNumber: props.ERF_NMBR || props.PRTY_NMBR || 'Unknown',
               allotmentArea: props.ALLOTMENT_AREA || 'City of Cape Town',
               address: props.ADRS_STRT_NAME ? `${props.ADRS_STRT_NO} ${props.ADRS_STRT_NAME}, ${props.ADRS_SBRB}` : null,
               center: { lat, lng },
               status: 'live',
               zoning: props.ZONING || 'Not available from source'
            };
         });
         setResults(parsed);
         return;
      }

      // Fallback to local FB if needed
      let q = query(
        collection(db, 'erfs'),
        where('erfNumber', '==', erfNumber)
      );

      if (allotmentArea) {
        q = query(q, where('allotmentArea', '==', allotmentArea));
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ErfRecord));
      setResults(data);
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "Search operation failed.");
    } finally {
      setIsSearching(false);
    }
  };

  // Live prefix search for suggestions
  const searchSuggestions = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const liveData = await searchCCTParcels(searchTerm);
      let parsed: ErfRecord[] = [];
      
      if (liveData && liveData.features) {
         parsed = liveData.features.map((f: any) => {
            const props = f.properties;
            let lat = 0, lng = 0;
            if (f.geometry?.type === 'Polygon') {
              lng = f.geometry.coordinates[0][0][0];
              lat = f.geometry.coordinates[0][0][1];
            } else if (f.geometry?.type === 'MultiPolygon') {
              lng = f.geometry.coordinates[0][0][0][0];
              lat = f.geometry.coordinates[0][0][0][1];
            }
            return {
               id: `cct-${props.OBJECTID}`,
               erfNumber: props.ERF_NMBR || props.PRTY_NMBR || 'Unknown',
               allotmentArea: props.ALLOTMENT_AREA || 'City of Cape Town',
               address: props.ADRS_STRT_NAME ? `${props.ADRS_STRT_NO || ''} ${props.ADRS_STRT_NAME}, ${props.ADRS_SBRB}`.trim() : null,
               center: { lat, lng },
               status: 'live',
               zoning: props.ZONING || 'Not available from source'
            };
         });
      }

      // If no local parcel results or few results, try geocoding
      if (parsed.length < 3) {
        try {
          const { geocodeAddress } = await import('@/services/geocodingService');
          const geocodeResults = await geocodeAddress(searchTerm);
          
          if (geocodeResults && geocodeResults.length > 0) {
            const geocodeErfRecords = geocodeResults.map((r, i) => ({
              id: `geocode-${r.source}-${i}`,
              erfNumber: 'Address Match',
              allotmentArea: r.formattedAddress || 'Location Match',
              address: r.address || r.formattedAddress,
              center: { lat: r.lat, lng: r.lng },
              status: 'geocode'
            }));
            
            // Append geocoded results
            parsed = [...parsed, ...geocodeErfRecords];
          }
        } catch (geocodeErr) {
          console.warn("Geocoding failed during search suggestions", geocodeErr);
        }
      }

      setResults(parsed);
    } catch (err: any) {
      console.error("Suggestions failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return { results, isSearching, error, searchByErfNumber, searchSuggestions, clearResults, fetchErfDetails };
}
