export interface OGCServiceInfo {
  type: 'WMS' | 'WMTS' | 'VectorTile' | 'RasterTile';
  layers?: string[];
  mapLibreSource: any;
  mapLibreLayer?: any;
}

export async function detectOGCService(url: string): Promise<OGCServiceInfo | null> {
  // Check for common tile patterns
  if (url.includes('{z}') && url.includes('{x}') && url.includes('{y}')) {
    if (url.includes('.pbf') || url.includes('.mvt')) {
      return {
        type: 'VectorTile',
        mapLibreSource: {
          type: 'vector',
          tiles: [url],
        }
      };
    } else {
      return {
        type: 'RasterTile',
        mapLibreSource: {
          type: 'raster',
          tiles: [url],
          tileSize: 256
        }
      };
    }
  }

  // Check WMS / WMTS GetCapabilities
  let capabilitiesUrl = url;
  if (!url.toLowerCase().includes('request=getcapabilities')) {
    const separator = url.includes('?') ? '&' : '?';
    capabilitiesUrl = `${url}${separator}service=WMS&request=GetCapabilities`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(capabilitiesUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
       // try WMTS
       const wmtsUrl = url.includes('?') ? `${url}&service=WMTS&request=GetCapabilities` : `${url}?service=WMTS&request=GetCapabilities`;
       const wmtsRes = await fetch(wmtsUrl);
       if (!wmtsRes.ok) throw new Error("Unsupported service");
       const txt = await wmtsRes.text();
       if (txt.includes('TileMatrixSet')) {
         return {
           type: 'WMTS',
           mapLibreSource: {
             type: 'raster',
             tiles: [url.split('?')[0] + '?service=WMTS&request=GetTile&version=1.0.0&layer=default&style=default&tilematrixset=EPSG:3857&tilematrix={z}&tilerow={y}&tilecol={x}&format=image/png'],
             tileSize: 256
           }
         };
       }
       throw new Error("Unsupported service");
    }

    const text = await response.text();
    const isWMS = text.includes('<WMS_Capabilities') || text.includes('<WMT_MS_Capabilities');
    
    if (isWMS) {
       // Simple extraction of layer names
       const layers: string[] = [];
       const layerRegex = /<Name>([^<]+)<\/Name>/g;
       let match;
       while ((match = layerRegex.exec(text)) !== null) {
          if (match[1] !== 'WMS' && match[1] !== 'Layers') { // ignore root
             layers.push(match[1]);
          }
       }

       const wmsTileUrl = url.includes('?') 
          ? `${url}&service=WMS&request=GetMap&layers=${layers[0] || ''}&styles=&format=image/png&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}`
          : `${url}?service=WMS&request=GetMap&layers=${layers[0] || ''}&styles=&format=image/png&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}`;

       return {
         type: 'WMS',
         layers,
         mapLibreSource: {
           type: 'raster',
           tiles: [wmsTileUrl],
           tileSize: 256
         }
       };
    }

    return null;
  } catch (err) {
    throw new Error('Service detection failed or timed out: ' + (err as Error).message);
  }
}
