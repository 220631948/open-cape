import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, Loader2, MapPin, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useErfSearch, ErfRecord } from '@/hooks/useErfSearch';
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';

interface MapSearchProps {
  onResultSelect: (erf: ErfRecord) => void;
}

const RECENT_SEARCHES_KEY = 'recentPropertySearches';

export const MapSearch: React.FC<MapSearchProps> = ({ onResultSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { results, isSearching, searchSuggestions, clearResults } = useErfSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
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
    onResultSelect(result);
    const displayTerm = result.address || result.erfNumber || '';
    setSearchTerm(displayTerm);
    saveRecentSearch(displayTerm);
    setIsOpen(false);
    inputRef.current?.blur();
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
    <div className="relative w-full pointer-events-auto" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          aria-activedescendant={selectedIndex >= 0 ? `item-${selectedIndex}` : undefined}
          placeholder="Search property types, street names, suburbs..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-10 bg-white shadow-md border-surface-200 focus-visible:ring-indigo-500 rounded-full h-11"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-surface-400" />
        )}
        {searchTerm && (
           <button 
             onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }}
             className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 rounded-full hover:bg-surface-100 p-0.5 transition-colors"
             aria-label="Clear search"
           >
             <X className="h-4 w-4" />
           </button>
        )}
      </div>

      {showRecent && (
        <div id="search-dropdown" role="listbox" className="absolute top-12 left-0 right-0 bg-white rounded-xl shadow-xl border border-surface-200 overflow-hidden z-50">
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
                 <div className="flex items-center gap-2 text-sm text-surface-700">
                   <Clock className="w-4 h-4 text-surface-400" />
                   {term}
                 </div>
                 <button onClick={(e) => clearRecent(e, term)} aria-label="Clear recent search" className="text-surface-400 hover:text-rose-500 p-1 rounded-full hover:bg-surface-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                   <X className="w-3 h-3" />
                 </button>
               </li>
             ))}
           </ul>
        </div>
      )}

      {showResults && (
        <div id="search-dropdown" role="listbox" className="absolute top-12 left-0 right-0 bg-white rounded-xl shadow-xl border border-surface-200 overflow-hidden z-50 max-h-[28rem] overflow-y-auto">
          {isSearching && results.length === 0 ? (
            <div className="p-4 flex flex-col gap-3">
              {[1,2,3].map(i => (
                 <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-surface-200" />
                    <div className="flex-1 space-y-2">
                       <div className="h-3 w-1/2 bg-surface-200 rounded" />
                       <div className="h-2 w-1/3 bg-surface-200 rounded" />
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
                    className={cn("p-3 cursor-pointer transition-colors", selectedIndex === globalIdx ? "bg-indigo-50" : "hover:bg-surface-50")}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-100 p-1.5 rounded-md mt-0.5 shrink-0">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{result.address || result.erfNumber}</p>
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">
                          {result.allotmentArea && `Location: ${result.allotmentArea}`}
                          {result.zoning && ` • Zoning: ${result.zoning}`}
                        </p>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            </div>
          ) : (
            <div className="p-6 text-sm text-center text-surface-500 flex flex-col items-center gap-2">
              <Search className="w-6 h-6 text-surface-300" />
              No properties matched your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
