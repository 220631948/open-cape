import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, Loader2, Clock, X, Home } from 'lucide-react';
import { useErfSearch, ErfRecord } from '../../hooks/useErfSearch';
import { cn } from '../../lib/utils';
import { useDebounce } from 'use-debounce';

interface SearchBarProps {
  onSelect: (feature: ErfRecord) => void;
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

  const { results, isSearching, searchSuggestions, clearResults } = useErfSearch();

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

  const handleSelect = (result: ErfRecord) => {
    const displayTerm = result.address || result.erfNumber || '';
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

  const derivedResults = results.slice(0, 8);
  const showRecent = isOpen && debouncedSearch.length < 2 && recentSearches.length > 0;
  const showResults = isOpen && debouncedSearch.length >= 2;
  const uniqueSuburbs = Array.from(new Set(results.map(r => r.allotmentArea).filter(Boolean)));
  const uniqueStreets = Array.from(new Set(results.map(r => {
    if (!r.address) return null;
    const parts = r.address.split(',')[0].trim().split(' ');
    if (parts.length > 1 && !isNaN(Number(parts[0]))) {
      return parts.slice(1).join(' ');
    }
    const street = r.address.split(',')[0].trim();
    // Use regex to remove numbers at start if still present
    return street.replace(/^\d+\s*/, '');
  }).filter(Boolean)));
  const uniquePropertyTypes = Array.from(new Set(results.map(r => r.zoning).filter(Boolean)));

  const suggestions = [
    ...uniqueSuburbs.map(s => ({ type: 'suburb', text: s })),
    ...uniqueStreets.map(s => ({ type: 'street', text: s })),
    ...uniquePropertyTypes.map(s => ({ type: 'type', text: s })),
  ].slice(0, 5); // Max 5 category suggestions

  const listMode = showRecent ? 'recent' : (showResults ? 'results' : 'none');
  const maxIndex = listMode === 'recent' 
    ? recentSearches.length - 1 
    : suggestions.length + derivedResults.length - 1;

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
      if (listMode === 'recent' && selectedIndex >= 0) {
        handleRecentSelect(recentSearches[selectedIndex]);
      } else if (listMode === 'results' && selectedIndex >= 0) {
        if (selectedIndex < suggestions.length) {
          handleRecentSelect(suggestions[selectedIndex].text!);
        } else {
          handleSelect(derivedResults[selectedIndex - suggestions.length]);
        }
      } else if (derivedResults.length > 0) {
        handleSelect(derivedResults[0]);
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
          placeholder="Search property types, street names, suburbs..."
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
        {isSearching && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0 ml-2" />}
        {searchTerm && (
           <button 
             onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }}
             className="ml-2 text-surface-400 hover:text-surface-600 transition-colors rounded-full hover:bg-surface-100 p-0.5"
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
                 <button onClick={(e) => clearRecent(e, term)} className="text-surface-400 hover:text-rose-500 p-1 rounded-full hover:bg-surface-100 transition-colors">
                   <X className="w-3 h-3" />
                 </button>
               </li>
             ))}
           </ul>
        </div>
      )}

      {showResults && (
        <div id="search-dropdown" role="listbox" className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-xl border border-surface-200 overflow-hidden max-h-[28rem] overflow-y-auto">
          {isSearching && results.length === 0 ? (
            <div className="p-4 flex flex-col gap-3">
              {[1,2,3].map(i => (
                 <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-surface-100" />
                    <div className="flex-1 space-y-2">
                       <div className="h-3 w-2/3 bg-surface-100 rounded" />
                       <div className="h-2 w-1/3 bg-surface-100 rounded" />
                    </div>
                 </div>
              ))}
            </div>
          ) : derivedResults.length > 0 || suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.length > 0 && (
                <div className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-widest bg-surface-50 border-b border-surface-100">
                  Suggestions
                </div>
              )}
              <ul className="divide-y divide-surface-100">
                {suggestions.map((suggestion, idx) => (
                  <li 
                    key={`sug-${idx}`} 
                    id={`item-${idx}`}
                    role="option"
                    aria-selected={selectedIndex === idx}
                    className={cn("px-4 py-2 cursor-pointer flex items-center gap-3 transition-colors", selectedIndex === idx ? "bg-indigo-50" : "hover:bg-surface-50")}
                    onClick={() => handleRecentSelect(suggestion.text!)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Search className="w-4 h-4 text-surface-400 shrink-0" />
                    <span className="text-sm text-surface-900 font-medium">{suggestion.text}</span>
                    <span className="text-xs text-surface-400 ml-auto capitalize">{suggestion.type}</span>
                  </li>
                ))}
              </ul>
              
              {derivedResults.length > 0 && (
                <div className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-widest bg-surface-50 border-y border-surface-100">
                  Properties
                </div>
              )}
              <ul className="divide-y divide-surface-100">
                {derivedResults.map((result, idx) => {
                  const globalIdx = suggestions.length + idx;
                  return (
                  <li 
                    key={result.id} 
                    id={`item-${globalIdx}`}
                    role="option"
                    aria-selected={selectedIndex === globalIdx}
                    className={cn("px-4 py-2.5 cursor-pointer flex items-start gap-3 transition-colors", selectedIndex === globalIdx ? "bg-indigo-50" : "hover:bg-surface-50")}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <div className="mt-0.5 shrink-0 bg-indigo-100 text-indigo-600 rounded p-1">
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-surface-900 truncate">
                        {result.address || result.erfNumber || 'Unknown Property'}
                      </span>
                      <span className="text-xs text-surface-500 truncate mt-0.5">
                        {result.allotmentArea && `City of Cape Town - ${result.allotmentArea}`}
                      </span>
                      <div className="flex gap-2 mt-1">
                        {result.zoning && <span className="inline-flex text-[10px] font-medium bg-surface-100 text-surface-600 px-1.5 rounded">{result.zoning}</span>}
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            </div>
          ) : (
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
