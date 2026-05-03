/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchArcGISLayerAsGeoJSON(
  url: string, 
  outFields: string = '*', 
  onProgress?: (loaded: number, total: number | null) => void,
  bbox?: [number, number, number, number] | null,
  signal?: AbortSignal
) {
  let totalCount: number | null = null;
  let objectIds: number[] = [];

  try {
     const countParams = new URLSearchParams({
       where: '1=1',
       returnIdsOnly: 'true',
       f: 'json'
     });

     if (bbox) {
       countParams.append('geometry', bbox.join(','));
       countParams.append('geometryType', 'esriGeometryEnvelope');
       countParams.append('inSR', '4326');
       countParams.append('spatialRel', 'esriSpatialRelIntersects');
     }

     const countReq = await fetch(`${url}/query`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: countParams,
       signal
     });
     if (countReq.ok) {
       const countData = await countReq.json();
       if (countData.objectIds && Array.isArray(countData.objectIds)) {
         objectIds = countData.objectIds;
         totalCount = objectIds.length;
       } else {
         // Fallback to get count only
         const countOnlyParams = new URLSearchParams(countParams.toString());
         countOnlyParams.set('returnCountOnly', 'true');
         countOnlyParams.delete('returnIdsOnly');
         try {
           const countOnlyReq = await fetch(`${url}/query`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
             body: countOnlyParams,
             signal
           });
           if (countOnlyReq.ok) {
              const res = await countOnlyReq.json();
              if (res.count !== undefined) {
                 totalCount = res.count;
              }
           }
         } catch {
             // Ignore count error
         }
       }
     }
  } catch (e: any) {
     if (e.name === 'AbortError') throw e;
     console.warn('Could not fetch object Ids for', url, e);
  }

  const maxRecordCount = 1000; // Optimal batch size for modern ArcGIS servers
  // Hard limit for province-wide datasets in browser memory to prevent crash
  const absoluteMaxFeatures = 100000; 
  let allFeatures: any[] = [];
  const maxRetries = 3;

  if (objectIds.length > 0) {
    // Query by IDs chunked
    const idsToFetch = objectIds.slice(0, absoluteMaxFeatures);
    
    // Batch processing with slightly more efficient loop
    for (let i = 0; i < idsToFetch.length; i += maxRecordCount) {
      const chunkIds = idsToFetch.slice(i, i + maxRecordCount);
      let retryCount = 0;
      let success = false;
      while (!success && retryCount <= maxRetries) {
         if (signal?.aborted) throw new Error('Aborted');
         try {
           const req = await fetch(`${url}/query`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
             },
             body: new URLSearchParams({
                objectIds: chunkIds.join(','),
                outFields: outFields,
                outSR: '4326',
                f: 'geojson'
             }),
             signal 
           });
           if (!req.ok) throw new Error(`HTTP ${req.status}`);
           const data = await req.json();
           
           if (data.error) throw new Error(`ArcGIS Error: ${data.error.message}`);
           
           if (data.features) {
             allFeatures = allFeatures.concat(data.features);
           }
           success = true;
           if (onProgress) onProgress(allFeatures.length, totalCount);
         } catch(err: any) {
           if (err.name === 'AbortError' || err.message === 'Aborted') throw err;
           console.error(err);
           retryCount++;
           if (retryCount > maxRetries) {
             console.error(`Max retries reached, aborting fetch.`);
             break;
           }
           await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
         }
      }
    }
  } else {
    // Fallback to resultOffset
    let offset = 0;
    let hasMore = true;
    let retryCount = 0;

    while (hasMore && allFeatures.length < absoluteMaxFeatures) {
      if (signal?.aborted) throw new Error('Aborted');
      
      const queryParams = new URLSearchParams({
        where: '1=1',
        outFields: outFields,
        outSR: '4326',
        f: 'geojson',
        resultOffset: offset.toString(),
        resultRecordCount: maxRecordCount.toString()
      });

      if (bbox) {
        queryParams.append('geometry', bbox.join(','));
        queryParams.append('geometryType', 'esriGeometryEnvelope');
        queryParams.append('inSR', '4326');
        queryParams.append('spatialRel', 'esriSpatialRelIntersects');
      }

      try {
        console.log(`Fetching offset ${offset}...`);
        const req = await fetch(`${url}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: queryParams,
          signal
        });
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
        retryCount = 0; // Reset retries on successful fetch

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
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message === 'Aborted') throw err;
        console.error(err);
        retryCount++;
        if (retryCount > maxRetries) {
          console.error('Max retries reached, aborting fetch.');
          hasMore = false;
        } else {
          console.log(`Retrying chunk offset ${offset} (attempt ${retryCount} of ${maxRetries})...`);
          // Add exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }
    }
  }

  // Sanitize Geometries
  // Cape Town roughly: Lon 18.0 to 19.5, Lat -34.5 to -33.0
  // South Africa: Lon 16 to 33, Lat -35 to -22
  // Deduplicate before geometry check
  const seenIds = new Set();
  const deduplicatedFeatures = allFeatures.filter(f => {
      const id = f.properties?.OBJECTID || f.properties?.id;
      if (id !== undefined) {
         if (seenIds.has(id)) return false;
         seenIds.add(id);
      }
      return true;
  });

  const cleanedFeatures = deduplicatedFeatures.filter(feature => {
    if (!feature.geometry) return false;
    
    // Check if Point type and sanitize
    if (feature.geometry.type === 'Point') {
       let [lon, lat] = feature.geometry.coordinates;
       
       // Handle flipped coordinates (assuming SA bounds)
       if (lat > 0 && lon < 0) {
          // Both signs flipped
          feature.geometry.coordinates = [-lon, -lat];
          lon = feature.geometry.coordinates[0];
          lat = feature.geometry.coordinates[1];
       } else if (lat > 16 && lon < -22) {
          // Swapped lon and lat
          feature.geometry.coordinates = [lat, lon];
          lon = feature.geometry.coordinates[0];
          lat = feature.geometry.coordinates[1];
       } else if (lon >= 16 && lon <= 33 && lat >= 22 && lat <= 35) {
          // Missing negative sign on latitude
          feature.geometry.coordinates = [lon, -lat];
          lon = feature.geometry.coordinates[0];
          lat = feature.geometry.coordinates[1];
       } else if (lat >= 16 && lat <= 33 && lon >= 22 && lon <= 35) {
          // Swapped and missing negative sign
          feature.geometry.coordinates = [lat, -lon];
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
