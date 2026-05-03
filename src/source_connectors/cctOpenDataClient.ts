/* eslint-disable @typescript-eslint/no-explicit-any, no-useless-assignment */
import * as turf from '@turf/turf';

export const CCT_OPEN_DATA_CONFIG = {
  parcelsEndpoint: 'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_PlanningCadastre/MapServer/1',
  zoningEndpoint: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/59', // Keep CCT for zoning as WC doesn't have a consolidated layer
  openDataPortalQueryUrl: 'https://opendata.arcgis.com/api/v3/datasets',
};

function normalizeGeoJSON(data: any) {
  if (data && data.features && Array.isArray(data.features)) {
    // Rewind geometries to ensure right hand rule for MapLibre/Mapbox
    data.features = data.features.map((f: any) => turf.rewind(turf.cleanCoords(f), { reverse: true }));
  }
  return data;
}

// Types corresponding to feature properties 
export interface CCTParcel {
  OBJECTID: number;
  PRTY_NMBR?: string;
  ALLOTMENT_AREA?: string;
  ERF_NMBR?: string;
  LU_PRTY_USE_DESC?: string; // e.g. "Residential"
  SBDV_NMBR?: string;
  ZONING?: string; // e.g. "General Residential 4"
  // some datasets have other fields
}

export async function queryCCTParcelsByCoords(lng: number, lat: number) {
  // Use arcgis REST API to query by geometry
  // f=geojson&geometryType=esriGeometryPoint&geometry={"x":lng,"y":lat,"spatialReference":{"wkid":4326}}&inSR=4326&outSR=4326
  
  const geometry = encodeURIComponent(JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }));
  const url = `${CCT_OPEN_DATA_CONFIG.parcelsEndpoint}/query?f=geojson&geometryType=esriGeometryPoint&geometry=${geometry}&inSR=4326&outSR=4326&outFields=*&returnGeometry=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return normalizeGeoJSON(data); // GeoJSON FeatureCollection
  } catch (error) {
    console.error('Failed to query CCT Parcels', error);
    throw error;
  }
}

export async function queryCCTZoningByCoords(lng: number, lat: number) {
  const geometry = encodeURIComponent(JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }));
  const url = `${CCT_OPEN_DATA_CONFIG.zoningEndpoint}/query?f=geojson&geometryType=esriGeometryPoint&geometry=${geometry}&inSR=4326&outSR=4326&outFields=*&returnGeometry=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return normalizeGeoJSON(data);
  } catch (error) {
    console.error('Failed to query CCT Zoning', error);
    throw error;
  }
}

export async function queryCCTParcelById(objectId: string) {
  const url = `${CCT_OPEN_DATA_CONFIG.parcelsEndpoint}/query?f=geojson&where=OBJECTID=${objectId}&outFields=*&returnGeometry=true`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return normalizeGeoJSON(data);
  } catch (error) {
    console.error('Failed to query CCT Parcel by ID', error);
    throw error;
  }
}

export async function searchCCTParcels(searchTerm: string) {
  // If it's pure numbers, could be TAG_VALUE
  const isNumeric = /^\d+$/.test(searchTerm.trim());
  let where = `TAG_VALUE LIKE '${searchTerm.toUpperCase()}%' OR Town_name LIKE '${searchTerm.toUpperCase()}%'`;
  if (isNumeric) {
    where = `TAG_VALUE = '${searchTerm}'`;
  } else {
    // Also include STR_NAME since we are dealing with land parcels layer 57 which has it
    where = `Town_name LIKE '${searchTerm.toUpperCase()}%' OR MUNICNAME LIKE '${searchTerm.toUpperCase()}%'`;
  }
  
  const url = `${CCT_OPEN_DATA_CONFIG.parcelsEndpoint}/query?f=geojson&where=${encodeURIComponent(where)}&outFields=*&returnGeometry=true&resultRecordCount=10`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return normalizeGeoJSON(data);
  } catch (error) {
    console.error('Failed to search CCT Parcels', error);
    throw error;
  }
}

export async function getLiveErfRecordById(objectId: string): Promise<any | null> {
  try {
    const parcelData = await queryCCTParcelById(objectId);
    if (parcelData && parcelData.features && parcelData.features.length > 0) {
      const feature = parcelData.features[0];
      const props = feature.properties;
      
      let lat = 0, lng = 0;
      if (feature.geometry?.type === 'Polygon') {
        lng = feature.geometry.coordinates[0][0][0];
        lat = feature.geometry.coordinates[0][0][1];
      }

      // Query zoning by coords roughly
      let zoningFeature, zoningProps;
      if (lng !== 0) {
        const zoningData = await queryCCTZoningByCoords(lng, lat).catch(() => null);
        zoningFeature = zoningData?.features?.[0];
        zoningProps = zoningFeature?.properties;
      }

      return {
        id: `wcgp-${props.OBJECTID}`,
        objectId: props.OBJECTID,
        erfNumber: props.TAG_VALUE || props.ERF_NMBR || props.PRTY_NMBR || 'Unknown ERF',
        allotmentArea: props.Town_name || props.MUNICNAME || props.ALLOTMENT_AREA || props.OFC_SBRB_NAME || 'Western Cape',
        address: props.ADRS_STRT_NAME ? `${props.ADRS_STRT_NO} ${props.ADRS_STRT_NAME}, ${props.ADRS_SBRB}` : 
                 props.STR_NAME ? `${props.ADR_NO || ''} ${props.STR_NAME} ${props.LU_STR_NAME_TYPE || ''}, ${props.OFC_SBRB_NAME || ''}`.trim() : null,
        center: { lat, lng },
        status: 'live',
        zoning: zoningProps?.INT_ZONE_DESC || zoningProps?.CODE_DESC || props.ZONING || 'Not available from source',
        zoningCategory: zoningProps?.INT_ZONE_DESC || zoningProps?.CAT_DESC || 'Unknown',
        geometry: feature.geometry,
        parcelFeature: feature,
        zoningFeature: zoningFeature,
        properties: props,
        provenance: {
           sourceId: 'wcgp-sg-cadastre',
           sourceName: 'Western Cape SG Cadastre (Erven)',
           recordId: props.OBJECTID?.toString(),
           geometryType: feature.geometry?.type || 'Unknown',
           fetchedAt: new Date().toISOString(),
           verifiedAt: new Date().toISOString(),
           verificationStatus: 'verified-source-record',
           displayMode: feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon' ? 'source-geometry' : 'point-overview'
        }
      };
    }
  } catch(e) {
    console.error("Error creating live Erf record by Id", e);
  }
  return null;
}
export async function getLiveErfRecord(lng: number, lat: number, mapFeature?: any): Promise<any | null> {
  try {
    const [parcelData, zoningData] = await Promise.all([
      queryCCTParcelsByCoords(lng, lat).catch(() => null),
      queryCCTZoningByCoords(lng, lat).catch(() => null)
    ]);
    
    // Process parcel data first
    if (parcelData && parcelData.features && parcelData.features.length > 0) {
      const feature = parcelData.features[0];
      const props = feature.properties;
      
      const zoningFeature = zoningData?.features?.[0];
      const zoningProps = zoningFeature?.properties;

      return {
        id: `wcgp-${props.OBJECTID}`,
        erfNumber: props.TAG_VALUE || props.ERF_NMBR || props.PRTY_NMBR || 'Unknown ERF',
        allotmentArea: props.Town_name || props.MUNICNAME || props.ALLOTMENT_AREA || props.OFC_SBRB_NAME || 'Western Cape',
        address: props.ADRS_STRT_NAME ? `${props.ADRS_STRT_NO} ${props.ADRS_STRT_NAME}, ${props.ADRS_SBRB}` : 
                 props.STR_NAME ? `${props.ADR_NO || ''} ${props.STR_NAME} ${props.LU_STR_NAME_TYPE || ''}, ${props.OFC_SBRB_NAME || ''}`.trim() : null,
        center: { lat, lng },
        status: 'live',
        zoning: zoningProps?.INT_ZONE_DESC || zoningProps?.CODE_DESC || props.ZONING || 'Not available from source',
        zoningCategory: zoningProps?.INT_ZONE_DESC || zoningProps?.CAT_DESC || 'Unknown',
        geometry: feature.geometry,
        parcelFeature: feature,
        zoningFeature: zoningFeature,
        properties: props,
        provenance: {
           sourceId: 'wcgp-sg-cadastre',
           sourceName: 'Western Cape SG Cadastre (Erven)',
           recordId: props.OBJECTID?.toString(),
           geometryType: feature.geometry?.type || 'Unknown',
           fetchedAt: new Date().toISOString(),
           verifiedAt: new Date().toISOString(),
           verificationStatus: 'verified-source-record',
           displayMode: feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon' ? 'source-geometry' : 'point-overview'
        }
      };
    } else if (mapFeature) {
      // Fallback to WCGP or other vector layer feature
      const props = mapFeature.properties;
      return {
        id: `wcgp-${props.OBJECTID || props.id || Math.random().toString(36).substr(2, 9)}`,
        erfNumber: props.erf_number || props.ERF_NMBR || props.PRTY_NMBR || 'Unknown ERF',
        allotmentArea: props.municipality || 'Western Cape',
        address: props.address || null,
        center: { lat, lng },
        status: 'live',
        zoning: props.zoning || 'Not available from source',
        zoningCategory: props.zoning || 'Unknown',
        geometry: mapFeature.geometry || { type: "Point", coordinates: [lng, lat] },
        parcelFeature: mapFeature,
        zoningFeature: null,
        properties: props,
        provenance: {
           sourceId: mapFeature.layer?.id || 'wcgp-cadastre-vector',
           sourceName: 'Western Cape Spatial Data Warehouse',
           recordId: (props.OBJECTID || props.id)?.toString() || 'unknown',
           geometryType: mapFeature.geometry?.type || 'Unknown',
           fetchedAt: new Date().toISOString(),
           verifiedAt: new Date().toISOString(),
           verificationStatus: 'verified-source-record',
           displayMode: mapFeature.geometry?.type === 'Polygon' || mapFeature.geometry?.type === 'MultiPolygon' ? 'source-geometry' : 'point-overview'
        }
      };
    }
  } catch (e) {
    console.error("Error creating live Erf Record", e);
  }
  return null;
}

