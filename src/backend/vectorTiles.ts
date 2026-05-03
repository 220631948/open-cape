import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';
import supercluster from 'supercluster';
import { getDb } from './firebase';

export async function generateVectorTiles(tenantId: string) {
  const db = getDb();
  
  // 1. Fetch properties for tenant. 
  // For cost optimization in extremely large datasets, this might be dumped via Dataflow or BigQuery.
  // For normal datasets (< 1M), we can fetch geometries (or use spatial data warehouse).
  // Ideally, use a projection or subset:
  const snap = await db.collection(`tenants/${tenantId}/properties`)
    .select('location', 'price', 'propertyType')
    .get();

  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (data.location && typeof data.location.lat === 'number' && typeof data.location.lng === 'number') {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat]
        },
        properties: {
          id: doc.id,
          price: data.price || 0,
          propertyType: data.propertyType || ''
        }
      });
    }
  });

  const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features
  };

  // 2. Cluster properties
  const clusterIndex = new supercluster({
    radius: 40,
    maxZoom: 16,
    map: (props: any) => ({
      count: 1,
      sum_price: props.price,
      distinct_types: { [props.propertyType]: 1 }
    }),
    reduce: (accumulated: any, props: any) => {
      accumulated.count += props.count;
      accumulated.sum_price += props.sum_price;
      for (const type in props.distinct_types) {
        accumulated.distinct_types[type] = (accumulated.distinct_types[type] || 0) + props.distinct_types[type];
      }
    }
  });

  clusterIndex.load(geojson.features);

  // Note: generating static tiles to Cloud Storage would involve iterating z, x, y up to maxZoom.
  // We can return the index to a map-friendly tile server or upload directly to GCS.
  return clusterIndex;
}

// Function to generate a specific tile
export function getTilePbf(clusterIndex: supercluster, z: number, x: number, y: number) {
  const tileFeatures = clusterIndex.getTile(z, x, y);
  
  if (!tileFeatures || tileFeatures.features.length === 0) {
    return null;
  }

  // Format properties for vector tile
  const formattedFeatures = tileFeatures.features.map((f: any) => {
    let props = f.tags || f.properties || {};
    
    // Process cluster properties
    if (props.cluster) {
       let dominantType = 'Unknown';
       let highestCount = 0;
       const types = props.distinct_types as Record<string, number>;
       if (types) {
          for (const key in types) {
             if (types[key] > highestCount) {
                highestCount = types[key];
                dominantType = key;
             }
          }
       }
       
       props = {
         cluster: true,
         point_count: props.point_count,
         avg_price: props.point_count > 0 ? Math.round(props.sum_price / props.point_count) : 0,
         dominant_type: dominantType
       };
    }
    
    return Object.assign({}, f, {
       properties: props,
       tags: props
    });
  });
  
  const tileGeoJson: GeoJSON.FeatureCollection = {
     type: 'FeatureCollection',
     features: formattedFeatures as any
  };

  // Generate Mapbox Vector Tile
  const tileIndex = geojsonvt(tileGeoJson, { maxZoom: 16, indexMaxZoom: 16 });
  const vtTile = tileIndex.getTile(0, 0, 0); // geojson-vt operates on the tile bounds directly if we pass pre-sliced?
  // Wait, supercluster already sliced the tile. We just need to encode it with vt-pbf.
  // Proper conversion:
  const pbf = vtpbf.fromGeojsonVt({ properties: vtTile });
  return pbf;
}
