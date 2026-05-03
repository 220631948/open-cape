import React, { useState, useRef, useEffect } from "react";
import { Search, X, Check, ChevronDown, MapPin, Loader2 } from "lucide-react";
import { useMunicipalityFilter } from "../../hooks/useMunicipalityFilter";
import { cn } from "../../lib/utils";

export const MunicipalitySelector: React.FC = () => {
  const {
    selectedMunicipality,
    availableMunicipalities,
    isLoading,
    setMunicipality,
    clearMunicipality,
    fetchMunicipalities,
  } = useMunicipalityFilter();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMunicipalities();
  }, [fetchMunicipalities]);

  // Accessible keyboard navigation and outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredMuni = availableMunicipalities.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full text-sm" ref={containerRef}>
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 bg-white border rounded-md cursor-pointer hover:bg-surface-50 transition-colors shadow-sm",
          isOpen ? "border-rose-400 ring-2 ring-rose-100" : "border-surface-200"
        )}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate text-surface-700">
          <MapPin className="w-4 h-4 text-surface-400" />
          <span className="truncate font-medium">
            {selectedMunicipality || "All Municipalities..."}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {selectedMunicipality && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearMunicipality();
              }}
              className="p-1 hover:bg-surface-200 rounded-full transition-colors text-surface-400 hover:text-surface-700"
              title="Clear Filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-surface-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-surface-200 shadow-xl rounded-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center px-2 border-b border-surface-100 bg-surface-50">
            <Search className="w-4 h-4 text-surface-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search municipality..."
              className="w-full py-2 bg-transparent outline-none text-surface-700 text-sm placeholder:text-surface-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsOpen(false);
              }}
            />
          </div>
          <ul
            className="max-h-60 overflow-y-auto py-1"
            role="listbox"
          >
            {isLoading ? (
              <li className="px-3 py-8 flex flex-col items-center justify-center text-surface-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                <span className="text-xs">Fetching municipalities...</span>
              </li>
            ) : filteredMuni.length > 0 ? (
              filteredMuni.map((muni) => (
                <li
                  key={muni}
                  role="option"
                  aria-selected={selectedMunicipality === muni}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface-100 transition-colors text-surface-700",
                    selectedMunicipality === muni && "bg-rose-50 text-rose-700 font-medium"
                  )}
                  onClick={() => {
                    if (selectedMunicipality === muni) {
                       clearMunicipality();
                    } else {
                       setMunicipality(muni);
                    }
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {muni}
                  {selectedMunicipality === muni && (
                    <Check className="w-4 h-4 text-rose-600" />
                  )}
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-center text-surface-500 italic text-xs">
                No municipalities found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
