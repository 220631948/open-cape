export async function fetchArcGISLayerAsGeoJSON(url: string, outFields: string = '*', onProgress?: (loaded: number, total: number | null) => void) {
  let totalCount: number | null = null;
  try {
     const countReq = await fetch(`${url}/query?where=1=1&returnCountOnly=true&f=json`);
     if (countReq.ok) {
       const countData = await countReq.json();
       if (typeof countData.count === 'number') {
         totalCount = countData.count;
       }
     }
  } catch (e) {
     console.warn('Could not fetch total count for', url, e);
  }

  const maxRecordCount = 1000;
  let allFeatures: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const queryUrl = `${url}/query?where=1=1&outFields=${outFields}&outSR=4326&f=geojson&resultOffset=${offset}&resultRecordCount=${maxRecordCount}`;
    try {
      console.log('Fetching', queryUrl);
      const req = await fetch(queryUrl);
      if (!req.ok) {
        throw new Error(`Failed to fetch layer: HTTP ${req.status}`);
      }
      const data = await req.json();
      
      if (data.error) {
        throw new Error(`ArcGIS Error: ${data.error.message}`);
      }

      if (!data.features || data.features.length === 0) {
        hasMore = false;
        break;
      }

      allFeatures = allFeatures.concat(data.features);

      if (onProgress) {
        onProgress(allFeatures.length, totalCount);
      }

      if (data.exceededTransferLimit) {
        offset += maxRecordCount;
      } else if (data.features.length === maxRecordCount) {
         // Some older servers don't return exceededTransferLimit but still paginate
         offset += maxRecordCount;
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.error(err);
      hasMore = false;
    }
  }

  // Sanitize Geometries
  // Cape Town roughly: Lon 18.0 to 19.5, Lat -34.5 to -33.0
  // South Africa: Lon 16 to 33, Lat -35 to -22
  const cleanedFeatures = allFeatures.filter(feature => {
    if (!feature.geometry) return false;
    
    // Check if Point type and sanitize
    if (feature.geometry.type === 'Point') {
       let [lon, lat] = feature.geometry.coordinates;
       
       // Handle flipped coordinates (assuming SA bounds)
       if (lat > 0 && lon < 0) {
          // Both flipped
          feature.geometry.coordinates = [-lon, -lat];
          lon = feature.geometry.coordinates[0];
          lat = feature.geometry.coordinates[1];
       } else if (lat > 16 && lon < -22) {
          // Swapped lon and lat
          feature.geometry.coordinates = [lat, lon];
          lon = feature.geometry.coordinates[0];
          lat = feature.geometry.coordinates[1];
       }

       // Final bounds check for South Africa to avoid ocean placements (0,0 etc)
       if (lon >= 16 && lon <= 33 && lat >= -35 && lat <= -22) {
          return true;
       }
       return false;
    }
    
    // Allow Polygons/Lines to pass through for now, or could check centroid
    return true;
  });

  return {
    type: 'FeatureCollection',
    features: cleanedFeatures
  };
}
