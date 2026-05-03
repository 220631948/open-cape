import { algoliasearch } from 'algoliasearch';

let algoliaClient: ReturnType<typeof algoliasearch> | null = null;

export function getAlgoliaClient() {
  if (!algoliaClient) {
    const appId = process.env.ALGOLIA_APP_ID;
    const apiKey = process.env.ALGOLIA_API_KEY; // Requires Admin API Key for indexing
    
    if (!appId || !apiKey) {
      console.warn('Algolia credentials not found in environment variables. Indexing functions will be skipped or mocked.');
      return null;
    }
    
    // Pass appId and apiKey directly
    algoliaClient = algoliasearch(appId, apiKey);
  }
  return algoliaClient;
}

let isInitialized = false;

export async function initializeAlgoliaIndices() {
  const client = getAlgoliaClient();
  if (!client || isInitialized) return;
  
  try {
     // If the client supports setSettings, configure attributesForFaceting
     // Using ts-ignore if typing doesn't match standard v4/v5 seamlessly
     // @ts-ignore
     if (typeof client.setSettings === 'function') {
         // @ts-ignore
         await client.setSettings({
            indexName: PROPERTIES_INDEX,
            indexSettings: {
               attributesForFaceting: [
                  'filterOnly(tenantId)',
                  'propertyType',
                  'status',
                  'bedrooms',
                  'bathrooms'
               ]
            }
         });
         
         // @ts-ignore
         await client.setSettings({
            indexName: PROPERTIES_AUTOCOMPLETE,
            indexSettings: {
               attributesForFaceting: [
                  'filterOnly(tenantId)',
                  'filterOnly(searchPrefix)'
               ]
            }
         });
     }
     isInitialized = true;
  } catch (err) {
     console.error('Failed to configure Algolia settings:', err);
  }
}

export const PROPERTIES_INDEX = 'properties_index';
export const PROPERTIES_AUTOCOMPLETE = 'properties_autocomplete';

export const SEARCH_PREFIX_LIMIT = 20;

export function generateSearchPrefixes(text: string): string[] {
  const normalized = text.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
  const tokens = normalized.split(/\s+/).filter(t => t.length >= 2);
  const prefixes: string[] = [];
  
  for (const token of tokens) {
    for (let i = 2; i <= token.length && i <= SEARCH_PREFIX_LIMIT; i++) {
        prefixes.push(token.substring(0, i));
    }
  }
  return Array.from(new Set(prefixes));
}
