import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchClient } from '../lib/algolia';

const ALGOLIA_INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'properties_index';

export const SearchAutocomplete = ({ onSelect }: { onSelect?: (hit: any) => void }) => {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isOpen, setIsOpen] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   useEffect(() => {
      const fetchResults = async () => {
         if (query.trim().length < 2) {
            setResults([]);
            return;
         }
         setIsLoading(true);
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
            const hits = (firstResult && 'hits' in firstResult) ? firstResult.hits : [];
            setResults(hits);
         } catch (e) {
            console.error(e);
            setResults([]);
         } finally {
            setIsLoading(false);
         }
      };
      const debounce = setTimeout(fetchResults, 300);
      return () => clearTimeout(debounce);
   }, [query]);

   const handleSelect = (hit: any) => {
      setQuery(hit.name || hit.address?.street || hit.id || '');
      setIsOpen(false);
      if (onSelect) {
         onSelect(hit);
      }
   };

   return (
      <div className="relative w-full max-w-md" ref={containerRef}>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
               type="text"
               value={query}
               onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
               }}
               placeholder="Search indexed properties with Algolia..."
               className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 animate-spin" />}
         </div>
         {isOpen && results.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-surface-200 rounded-md shadow-lg overflow-hidden z-50">
               {results.map((hit) => (
                  <div 
                     key={hit.objectID} 
                     onClick={() => handleSelect(hit)}
                     className="p-3 hover:bg-surface-50 cursor-pointer border-b last:border-0 border-surface-100"
                  >
                     <div className="font-medium text-surface-900 text-sm">{hit.name || hit.address?.street || hit.id}</div>
                     <div className="text-xs text-surface-500 line-clamp-1">
                        {hit.address?.city} {hit.address?.suburb}
                     </div>
                  </div>
               ))}
            </div>
         )}
         {isOpen && query.trim().length >= 2 && results.length === 0 && !isLoading && (
            <div className="absolute top-full mt-1 w-full bg-white border border-surface-200 rounded-md shadow-lg p-4 text-center text-sm text-surface-500 z-50">
               No properties found.
            </div>
         )}
      </div>
   );
};
