import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, Loader2, Clock, X, Home, Pencil, MessageSquare } from 'lucide-react';
import { useErfSearch, ErfRecord } from '../../hooks/useErfSearch';
import { useDrawings, Drawing } from '../../hooks/useDrawings';
import { useAnnotations, Annotation } from '../../hooks/useAnnotations';
import { cn } from '../../lib/utils';
import { useDebounce } from 'use-debounce';

type SearchResult = 
  | { type: 'erf', data: ErfRecord }
  | { type: 'drawing', data: Drawing }
  | { type: 'annotation', data: Annotation };

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
  className?: string;
}

const RECENT_SEARCHES_KEY = 'recentPropertySearches';

export const SearchBar: React.FC<SearchBarProps> = ({ onSelect, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results: erfResults, isSearching, searchSuggestions, clearResults } = useErfSearch();
  const { drawings } = useDrawings();
  const { annotations } = useAnnotations();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      searchSuggestions(debouncedSearch);
    } else {
      clearResults();
      setSelectedIndex(-1);
    }
  }, [debouncedSearch, searchSuggestions, clearResults]);

  const filteredDrawings = debouncedSearch.length >= 2 
    ? drawings.filter(d => d.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : [];

  const filteredAnnotations = debouncedSearch.length >= 2
    ? annotations.filter(a => 
        a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        a.body.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const saveRecentSearch = (term: string) => {
    const updated = [term].concat(recentSearches.filter(t => t !== term)).slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSelect = (result: SearchResult) => {
    let displayTerm = '';
    if (result.type === 'erf') displayTerm = result.data.address || result.data.erfNumber || '';
    if (result.type === 'drawing') displayTerm = result.data.title;
    if (result.type === 'annotation') displayTerm = result.data.title;

    setSearchTerm(displayTerm);
    saveRecentSearch(displayTerm);
    setIsOpen(false);
    inputRef.current?.blur();
    onSelect(result);
  };

  const handleRecentSelect = (term: string) => {
    setSearchTerm(term);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const showRecent = isOpen && debouncedSearch.length < 2 && recentSearches.length > 0;
  const showResults = isOpen && debouncedSearch.length >= 2;
  
  const derivedErfResults = erfResults.slice(0, 5);
  const derivedDrawings = filteredDrawings.slice(0, 3);
  const derivedAnnotations = filteredAnnotations.slice(0, 3);

  const totalResults = [
    ...derivedErfResults.map(r => ({ type: 'erf' as const, data: r })),
    ...derivedDrawings.map(d => ({ type: 'drawing' as const, data: d })),
    ...derivedAnnotations.map(a => ({ type: 'annotation' as const, data: a }))
  ];

  const maxIndex = showRecent ? recentSearches.length - 1 : totalResults.length - 1;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showRecent && selectedIndex >= 0) {
        handleRecentSelect(recentSearches[selectedIndex]);
      } else if (showResults && selectedIndex >= 0) {
        handleSelect(totalResults[selectedIndex]);
      } else if (totalResults.length > 0) {
        handleSelect(totalResults[0]);
      }
    }
  };

  return (
    <div className={cn("relative z-30 pointer-events-auto", className)} ref={containerRef}>
      <div className="flex items-center bg-white border border-surface-200 rounded-lg shadow-sm px-3 py-2 w-full md:w-96 transition-shadow focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
        <Search className="w-4 h-4 text-surface-400 mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          aria-activedescendant={selectedIndex >= 0 ? `item-${selectedIndex}` : ""}
          placeholder="Search properties, notes, drawings..."
          className="w-full bg-transparent outline-none text-sm text-surface-900 placeholder:text-surface-400"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {(isSearching) && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0 ml-2" />}
        {searchTerm && (
           <button 
             onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }}
             className="ml-2 text-surface-400 hover:text-surface-600 transition-colors rounded-full hover:bg-surface-100 p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
             aria-label="Clear search"
           >
             <X className="h-4 w-4" />
           </button>
        )}
      </div>

      {showRecent && (
        <div id="search-dropdown" role="listbox" className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-xl border border-surface-200 overflow-hidden max-h-80">
           <div className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-widest bg-surface-50 border-b border-surface-100">
             Recent Searches
           </div>
           <ul className="divide-y divide-surface-100 py-1">
             {recentSearches.map((term, idx) => (
               <li 
                 key={idx} 
                 id={`item-${idx}`}
                 role="option"
                 aria-selected={selectedIndex === idx}
                 className={cn("px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors", selectedIndex === idx ? "bg-indigo-50" : "hover:bg-surface-50")}
                 onClick={() => handleRecentSelect(term)}
                 onMouseEnter={() => setSelectedIndex(idx)}
               >
                 <div className="flex items-center gap-2 text-sm text-surface-700 font-medium">
                   <Clock className="w-4 h-4 text-surface-400 shrink-0" />
                   {term}
                 </div>
                 <button
                   onClick={(e) => clearRecent(e, term)}
                   className="text-surface-400 hover:text-rose-500 p-1 rounded-full hover:bg-surface-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                   aria-label={`Remove ${term} from recent searches`}
                 >
                   <X className="w-3 h-3" />
                 </button>
               </li>
             ))}
           </ul>
        </div>
      )}

      {showResults && (
        <div id="search-dropdown" role="listbox" className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-xl border border-surface-200 overflow-hidden max-h-[28rem] overflow-y-auto">
          {totalResults.length > 0 ? (
            <div className="py-1">
              <ul className="divide-y divide-surface-100">
                {totalResults.map((result, idx) => (
                  <li 
                    key={`${result.type}-${idx}`}
                    id={`item-${idx}`}
                    role="option"
                    aria-selected={selectedIndex === idx}
                    className={cn("px-4 py-2.5 cursor-pointer flex items-start gap-3 transition-colors", selectedIndex === idx ? "bg-indigo-50" : "hover:bg-surface-50")}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className={cn(
                      "mt-0.5 shrink-0 rounded p-1",
                      result.type === 'erf' ? "bg-indigo-100 text-indigo-600" :
                      result.type === 'drawing' ? "bg-purple-100 text-purple-600" :
                      "bg-amber-100 text-amber-600"
                    )}>
                      {result.type === 'erf' && <Home className="w-4 h-4" />}
                      {result.type === 'drawing' && <Pencil className="w-4 h-4" />}
                      {result.type === 'annotation' && <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-surface-900 truncate">
                        {result.type === 'erf' ? (result.data.address || result.data.erfNumber) : result.data.title}
                      </span>
                      <span className="text-xs text-surface-500 truncate mt-0.5">
                        {result.type === 'erf' ? (result.data.allotmentArea || 'Property Parcel') : 
                         result.type === 'drawing' ? `Drawing (${result.data.geometryType})` : 
                         `Note on ${result.data.targetType}`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : !isSearching && (
             <div className="p-6 text-sm text-center text-surface-500 flex flex-col items-center gap-2">
               <Search className="w-6 h-6 text-surface-300" />
               No results found
             </div>
          )}
        </div>
      )}
    </div>
  );
};
