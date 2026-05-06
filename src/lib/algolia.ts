import { liteClient as algoliasearch } from 'algoliasearch/lite';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const apiKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || '';

// Mock client that gracefully falls back to empty search results 
// when Algolia isn't configured, preventing crashes while letting the UI render.
const mockClient = {
  search: async () => ({
    results: [{ hits: [], nbHits: 0, page: 0, nbPages: 0, hitsPerPage: 0, processingTimeMS: 0, query: '' }]
  }),
  searchForFacetValues: async () => ([{ facetHits: [] }]),
  searchSingleIndex: async () => ({ hits: [] }),
};

export const searchClient = (appId && apiKey) ? algoliasearch(appId, apiKey) : mockClient as any;

