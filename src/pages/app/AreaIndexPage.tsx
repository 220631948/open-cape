import React from 'react';
import { Link } from 'react-router';
import { Map as MapIcon, Filter } from 'lucide-react';
import { Button, DataStatusBanner } from '@/components/ui';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';

export const AreaIndexPage = () => {
  return (
    <div className="flex flex-col h-full bg-surface-50">
      <header className="bg-white border-b border-surface-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-primary-600" />
                Areas & Precincts
              </h1>
              <p className="text-surface-500 mt-1 text-sm">
                Explore local planning areas, suburbs, and strategic zones.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <DataStatusBanner 
            status="Dataset status: Live CCT Open Data is available for selected areas. Certain features remain analytical."
          />

           <div className="bg-white p-4 border border-surface-200 rounded-lg shadow-sm flex items-center gap-4">
             <div className="relative flex-1">
               <SearchAutocomplete 
                  onSelect={(hit) => {
                     console.log('Selected from AreaIndexPage:', hit);
                  }}
               />
             </div>
             <Button variant="outline" disabled>
               <Filter className="w-4 h-4 mr-2" /> Filters
             </Button>
          </div>

          <div className="border-2 border-dashed border-surface-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-surface-50 min-h-[400px]">
            <MapIcon className="w-16 h-16 text-surface-300 mb-6" />
            <h2 className="text-xl font-semibold text-surface-900 mb-2">No area datasets connected yet.</h2>
            <p className="text-surface-500 max-w-md">
               Area intelligence will appear here once verified sources are connected. Use the map to explore regions currently.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link to="/app/map">
                <Button>Go to Map Workspace</Button>
              </Link>
              {/* Dummy link to demonstrate the area detail route */}
              <Link to="/app/areas/cbd-precinct">
                 <Button variant="outline">Preview Area Detail Shell</Button>
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
