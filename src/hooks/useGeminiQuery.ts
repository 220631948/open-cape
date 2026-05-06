import { useState } from 'react';
import { geminiService, SpatialQueryFilters } from '@/services/geminiService';

export function useGeminiQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseQuery = async (query: string): Promise<SpatialQueryFilters | null> => {
    setLoading(true);
    setError(null);
    try {
      const filters = await geminiService.parseSpatialQuery(query);
      if (!filters) {
        throw new Error('Failed to parse query filters');
      }
      return filters;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { parseQuery, loading, error };
}
