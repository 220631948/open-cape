import React, { useState, useEffect } from 'react';
import { searchClient } from "../lib/algolia";
import { Search, MapPin, Loader2 } from 'lucide-react';

const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'properties_index';

export default function SearchBox({ onSelect }: { onSelect?: (hit: any) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);
      try {
        const { results: searchResults } = await searchClient.search({
          requests: [
            {
              indexName: ALGOLIA_INDEX_NAME,
              query,
              hitsPerPage: 5,
            }
          ]
        });
        const firstResult = searchResults[0];
        setResults((firstResult && 'hits' in firstResult) ? firstResult.hits : []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-surface-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden">
        <Search className="absolute left-3 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by address, APN or erf..."
          className="w-full bg-transparent border-0 py-3 pl-10 pr-10 outline-none text-sm text-surface-900 placeholder:text-surface-400"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 w-4 h-4 text-surface-400 animate-spin" />
        )}
      </div>

      {(results.length > 0 || (query && !isSearching)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-surface-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <ul className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
              {results.map((hit: any) => (
                <li 
                  key={hit.objectID}
                  className="p-3 hover:bg-surface-50 cursor-pointer flex items-start gap-3 transition-colors"
                  onClick={() => {
                    if (onSelect) onSelect(hit);
                    setQuery(hit.address?.street || hit.name || query);
                    setResults([]);
                  }}
                >
                  <MapPin className="w-4 h-4 text-primary-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-medium text-surface-900">{hit.name || hit.address?.street || 'Unknown Property'}</h4>
                    <p className="text-xs text-surface-500">
                      {hit.suburb || hit.address?.suburb || hit.city || hit.address?.city} • {hit.propertyType}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : query && !isSearching && !error ? (
            <div className="p-4 text-center text-sm text-surface-500">
              No properties found matching your query.
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">
              {error}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
