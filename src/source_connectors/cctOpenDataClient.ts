import * as turf from '@turf/turf';

export const CCT_OPEN_DATA_CONFIG = {
  parcelsEndpoint: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/57',
  zoningEndpoint: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/59',
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
  // If it's pure numbers, could be PRTY_NMBR or ERF_NMBR
  const isNumeric = /^\d+$/.test(searchTerm.trim());
  let where = `ERF_NMBR LIKE '${searchTerm.toUpperCase()}%' OR ALLOTMENT_AREA LIKE '${searchTerm.toUpperCase()}%'`;
  if (isNumeric) {
    where = `ERF_NMBR = '${searchTerm}' OR PRTY_NMBR = '${searchTerm}'`;
  } else {
    // Also include STR_NAME since we are dealing with land parcels layer 57 which has it
    where = `PRTY_NMBR LIKE '${searchTerm.toUpperCase()}%' OR STR_NAME LIKE '${searchTerm.toUpperCase()}%' OR OFC_SBRB_NAME LIKE '${searchTerm.toUpperCase()}%'`;
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
        id: `cct-${props.OBJECTID}`,
        objectId: props.OBJECTID,
        erfNumber: props.ERF_NMBR || props.PRTY_NMBR || 'Unknown ERF',
        allotmentArea: props.ALLOTMENT_AREA || props.OFC_SBRB_NAME || 'City of Cape Town',
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
           sourceId: 'cct-land-parcels',
           sourceName: 'City of Cape Town Land Parcels',
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
export async function getLiveErfRecord(lng: number, lat: number): Promise<any | null> {
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
        id: `cct-${props.OBJECTID}`,
        erfNumber: props.ERF_NMBR || props.PRTY_NMBR || 'Unknown ERF',
        allotmentArea: props.ALLOTMENT_AREA || props.OFC_SBRB_NAME || 'City of Cape Town',
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
           sourceId: 'cct-land-parcels',
           sourceName: 'City of Cape Town Land Parcels',
           recordId: props.OBJECTID?.toString(),
           geometryType: feature.geometry?.type || 'Unknown',
           fetchedAt: new Date().toISOString(),
           verifiedAt: new Date().toISOString(),
           verificationStatus: 'verified-source-record',
           displayMode: feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon' ? 'source-geometry' : 'point-overview'
        }
      };
    }
  } catch (e) {
    console.error("Error creating live Erf Record", e);
  }
  return null;
}

