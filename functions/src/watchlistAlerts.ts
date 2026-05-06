import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function checkWatchlists(property: any, propertyId: string) {
  // Get all watchlists (in production, we'd scale this by matching locally or inverted index)
  // For now, simple O(N) evaluation since this is an MVP
  const watchlistsSnap = await db.collection('watchlists').get();
  
  const matchesToCreate = [];
  const now = new Date().toISOString();

  for (const doc of watchlistsSnap.docs) {
    const list = doc.data();
    const filters = list.filters || {};
    
    let isMatch = true;
    
    // Check Allotment Area (case insensitive)
    if (filters.allotmentArea && property.allotmentArea) {
      if (property.allotmentArea.toLowerCase() !== filters.allotmentArea.toLowerCase()) {
        isMatch = false;
      }
    } else if (filters.allotmentArea) {
      isMatch = false;
    }
    
    // Check Zoning
    if (filters.zoning && property.zoning) {
      if (!property.zoning.toLowerCase().includes(filters.zoning.toLowerCase())) {
         isMatch = false;
      }
    } else if (filters.zoning) {
      isMatch = false;
    }
    
    // Check Price against lastValuation or askingPrice
    const priceToCompare = property.askingPrice || property.lastValuation || property.landValue;
    if (priceToCompare) {
      if (filters.minPrice && priceToCompare < filters.minPrice) isMatch = false;
      if (filters.maxPrice && priceToCompare > filters.maxPrice) isMatch = false;
    } else if (filters.minPrice || filters.maxPrice) {
      isMatch = false;
    }

    if (isMatch) {
      // Check if match log for this ERF and watchlist already exists
      const existingMatch = await db.collection('match_logs')
         .where('watchlistId', '==', doc.id)
         .where('erfNumber', '==', property.erfNumber)
         .limit(1).get();
         
      if (existingMatch.empty) {
        matchesToCreate.push({
           watchlistId: doc.id,
           ownerUid: list.ownerUid,
           erfNumber: property.erfNumber || propertyId,
           allotmentArea: property.allotmentArea || 'Unknown',
           matchedAt: now,
           read: false
        });
      }
    }
  }

  // Batch insert
  if (matchesToCreate.length > 0) {
    const batch = db.batch();
    matchesToCreate.forEach(match => {
       const ref = db.collection('match_logs').doc();
       batch.set(ref, match);
    });
    await batch.commit();
  }
}

export const onPropertyCreated = onDocumentCreated('erfs/{erfId}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await checkWatchlists(data, event.params.erfId);
});

export const onPropertyUpdated = onDocumentUpdated('erfs/{erfId}', async (event) => {
  const after = event.data?.after.data();
  if (!after) return;
  // Technically we should check if fields that matter changed
  await checkWatchlists(after, event.params.erfId);
});
