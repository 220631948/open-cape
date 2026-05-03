import { Request, Response } from 'express';
import { getAlgoliaClient, PROPERTIES_INDEX, PROPERTIES_AUTOCOMPLETE } from './algolia';

export async function searchProperties(req: Request, res: Response) {
  try {
    const { tenantId, q, lat, lng, radius, priceMin, priceMax, bedrooms, propertyType, status, limit, cursor } = req.query;

    if (!tenantId) {
       return res.status(400).json({ error: 'tenantId is required for multi-tenant isolation' });
    }

    const client = getAlgoliaClient();
    if (!client) {
      return res.status(503).json({ error: 'Search service not configured' });
    }

    // Build Search Filters
    const filters: string[] = [`tenantId:${tenantId}`];

    if (priceMin) filters.push(`price >= ${priceMin}`);
    if (priceMax) filters.push(`price <= ${priceMax}`);
    if (bedrooms) filters.push(`bedrooms >= ${bedrooms}`);
    if (propertyType) filters.push(`propertyType:${propertyType}`);
    if (status) filters.push(`status:${status}`);

    const filterString = filters.join(' AND ');

    const searchParams: { indexName: string, query: string, searchParams: Record<string, string | number> } = {
      indexName: PROPERTIES_INDEX,
      query: (q as string) || '',
      searchParams: {
        filters: filterString,
        hitsPerPage: parseInt(limit as string) || 20,
      }
    };

    if (cursor) {
      searchParams.searchParams.page = parseInt(cursor as string) || 0;
    }

    // Geo Search Options
    if (lat && lng && radius) {
       searchParams.searchParams.aroundLatLng = `${lat}, ${lng}`;
       searchParams.searchParams.aroundRadius = parseInt(radius as string) || 5000; // in meters
    }

    const results = await client.searchSingleIndex(searchParams);
    
    // Set Cache-Control for optimized TTL
    res.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
    return res.json({
       hits: results.hits,
       nbHits: results.nbHits,
       page: results.page,
       nbPages: results.nbPages
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Internal search error' });
  }
}

export async function autocompleteProperties(req: Request, res: Response) {
  try {
    const { tenantId, q, limit } = req.query;

    if (!tenantId) {
       return res.status(400).json({ error: 'tenantId is required' });
    }
    
    if (!q || (q as string).length < 2) {
       return res.json({ hits: [] });
    }

    const client = getAlgoliaClient();
    if (!client) {
      return res.status(503).json({ error: 'Search service not configured' });
    }

    const prefixQuery = (q as string).toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');

    const params: { indexName: string, query: string, searchParams: Record<string, string | number> } = {
       indexName: PROPERTIES_AUTOCOMPLETE,
       query: '',
       searchParams: {
         filters: `tenantId:${tenantId} AND searchPrefix:${prefixQuery}`,
         hitsPerPage: parseInt(limit as string) || 8,
       }
    };

    const results = await client.searchSingleIndex(params);
    
    // Autocomplete responses should be fast & cached
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute cache
    return res.json({ hits: results.hits });

  } catch (error) {
    console.error('Autocomplete API Error:', error);
    return res.status(500).json({ error: 'Internal autocomplete error' });
  }
}
