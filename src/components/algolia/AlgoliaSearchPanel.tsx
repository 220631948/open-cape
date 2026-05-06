import React, { useState, useEffect } from 'react';
import { searchClient } from '../../lib/algolia';
import { Input } from '../ui/Input';
import { Search, MapPin, Filter } from 'lucide-react';

const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'properties_index';

interface AlgoliaSearchPanelProps {
  onLocate: (lng: number, lat: number) => void;
}

export const AlgoliaSearchPanel: React.FC<AlgoliaSearchPanelProps> = ({ onLocate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [facets, setFacets] = useState<any>({});
  const [isSearching, setIsSearching] = useState(false);
  
  // Facet state
  const [showFacets, setShowFacets] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [riskScoreMax, setRiskScoreMax] = useState<number>(100);

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { results: searchResults } = await searchClient.search({
          requests: [
            {
              indexName: ALGOLIA_INDEX_NAME,
              query,
              hitsPerPage: 5,
              facets: ['municipality', 'zoning_category'],
              facetFilters: selectedMunicipality ? [`municipality:${selectedMunicipality}`] : [],
              numericFilters: [`risk_score <= ${riskScoreMax}`]
            }
          ]
        });
        const firstResult = searchResults[0];
        setResults((firstResult && 'hits' in firstResult) ? firstResult.hits : []);
        setFacets((firstResult && 'facets' in firstResult) ? firstResult.facets : {});
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(doSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedMunicipality, riskScoreMax]);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-surface-200 overflow-hidden text-sm w-full">
      <div className="p-3 border-b border-surface-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-surface-400" />
        <Input 
          className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto" 
          placeholder="Search by address or APN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          className="p-1 hover:bg-surface-100 rounded text-surface-500"
          onClick={() => setShowFacets(!showFacets)}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {showFacets && (
        <div className="p-3 bg-surface-50 border-b border-surface-200 grid grid-cols-2 gap-2">
           <div>
              <label className="text-xs font-medium text-surface-500">Municipality</label>
              <select 
                className="mt-1 block w-full rounded-md border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={selectedMunicipality}
                onChange={e => setSelectedMunicipality(e.target.value)}
              >
                <option value="">All</option>
                <option value="Cape Town">Cape Town</option>
                <option value="Stellenbosch">Stellenbosch</option>
              </select>
           </div>
           <div>
              <label className="text-xs font-medium text-surface-500 flex justify-between">
                <span>Risk Score Max</span>
                <span>{riskScoreMax}</span>
              </label>
              <input 
                type="range" 
                className="w-full mt-2" 
                min="0" 
                max="100" 
                value={riskScoreMax}
                onChange={(e) => setRiskScoreMax(parseInt(e.target.value, 10))}
              />
           </div>
        </div>
      )}

      {results.length > 0 ? (
        <ul className="max-h-64 overflow-y-auto">
          {results.map((hit: any) => (
            <li 
              key={hit.objectID || hit.id} 
              className="p-3 border-b border-surface-100 hover:bg-surface-50 cursor-pointer flex items-start gap-3"
              onClick={() => {
                 if (hit.lng && hit.lat) onLocate(hit.lng, hit.lat);
                 else if (hit._geoloc) onLocate(hit._geoloc.lng, hit._geoloc.lat);
                 setResults([]);
                 setQuery(hit.address?.street || hit.name || query);
              }}
            >
              <MapPin className="w-4 h-4 text-primary-500 mt-0.5 min-w-4" />
              <div>
                <p className="font-medium text-surface-900">{hit.address?.street || hit.name || 'Unknown Address'}</p>
                <p className="text-xs text-surface-500">
                  {hit.address?.suburb || hit.address?.city || 'No City'} • {hit.propertyType || hit.zoning_category || 'No Zoning'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : query && !isSearching ? (
        <div className="p-4 text-center text-sm text-surface-500">
          No properties found matching your query.
        </div>
      ) : null}
      
      {isSearching && <div className="p-3 text-center text-xs text-surface-500">Searching...</div>}
    </div>
  );
};
