import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getAlgoliaClient, PROPERTIES_INDEX, PROPERTIES_AUTOCOMPLETE, generateSearchPrefixes } from './algolia';
import { getDb } from './firebase';

interface PropertyData {
  id: string;
  tenantId: string;
  name?: string;
  address?: {
    street?: string;
    suburb?: string;
    city?: string;
    postcode?: string;
  };
  location?: { lat: number; lng: number };
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  features?: string[];
  status?: string;
  updatedAt?: unknown;
}

export const indexPropertyTrigger = onDocumentWritten(
  {
    document: 'tenants/{tenantId}/properties/{propertyId}',
    retry: true, // Retry with exponential backoff if fails
  },
  async (event) => {
    const { tenantId, propertyId } = event.params;
    
    const client = getAlgoliaClient();
    
    const snapshotAfter = event.data?.after;
    
    // Check if document was deleted
    if (!snapshotAfter || !snapshotAfter.exists) {
      // Handle Delete
      if (client) {
         try {
            await client.deleteObject({
              indexName: PROPERTIES_INDEX,
              objectID: propertyId
            });
            await client.deleteObject({
              indexName: PROPERTIES_AUTOCOMPLETE,
              objectID: propertyId
            });
         } catch (error) {
            console.error(`Failed to delete index for ${propertyId}:`, error);
            throw error; // Let function runtime handle retry
         }
      }
      
      // Recompute tiles
      await queueTileRecomputation(tenantId);
      return;
    }

    // Handle Create / Update
    const property = snapshotAfter.data() as PropertyData;
    
    // Transform Document (excluding PII like street and price)
    const name = property.name || '';
    const suburb = property.address?.suburb || '';
    const city = property.address?.city || '';
    
    let combinedFeatures: string[] = [];
    if (property.features) {
       combinedFeatures = combinedFeatures.concat(property.features);
    }
    const searchTextParts = [
      name, suburb, city
    ].concat(combinedFeatures).filter(Boolean);
    
    const searchText = searchTextParts.join(' ');
    const searchPrefixes = generateSearchPrefixes(searchText);
    
    const indexRecord = {
      objectID: propertyId,
      tenantId: property.tenantId || tenantId,
      name,
      suburb,
      city,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      propertyType: property.propertyType || 'Unknown',
      features: property.features || [],
      status: property.status || 'Active',
      location: property.location ? { lat: property.location.lat, lng: property.location.lng } : null,
      _geoloc: property.location ? { lat: property.location.lat, lng: property.location.lng } : null, // For Algolia Geo search
      searchText,
      updatedAt: property.updatedAt ? ((property.updatedAt as any).toMillis?.() || Date.now()) : Date.now(),
    };
    
    const autocompleteRecord = {
      objectID: propertyId,
      tenantId: property.tenantId || tenantId,
      name,
      suburb,
      city,
      searchPrefix: searchPrefixes,
    };

    if (client) {
      try {
        await client.saveObject({
          indexName: PROPERTIES_INDEX,
          body: indexRecord
        });
        
        await client.saveObject({
          indexName: PROPERTIES_AUTOCOMPLETE,
          body: autocompleteRecord
        });
      } catch (error) {
        console.error(`Failed to index property ${propertyId}:`, error);
        
        // Dead letter queue handling for failed indexing
        try {
          const db = getDb();
          await db.collection('dead_letter_queue').add({
            type: 'algolia_index_failure',
            tenantId,
            propertyId,
            error: String(error),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
          });
        } catch (dlqError) {
          console.error('Failed to write to DLQ:', dlqError);
        }
        
        throw error; // Let it retry via exponential backoff
      }
    }

    // Recompute tiles for this tenant, only for affected area if location exists
    const affectedPoint = property.location ? { lat: property.location.lat, lng: property.location.lng } : undefined;
    await queueTileRecomputation(tenantId, affectedPoint);
  }
);

// Async queuing placeholder for vector tile recomputation
async function queueTileRecomputation(tenantId: string, affectedPoint?: { lat: number, lng: number }) {
  // Option 1: Create a PubSub trigger or Task Queue for tile generation
  // Option 2: Run directly (can be slow during batch ingestion, so queueing preferred)
  console.log(`[Queue] Recomputing tiles for tenant: ${tenantId}`);
  try {
     const db = getDb();
     await db.collection('_jobs').add({
        type: 'tile_recompute',
        tenantId,
        affectedPoint: affectedPoint || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
     });
  } catch (e) {
     console.error('Failed to queue tile recompute:', e);
  }
}
