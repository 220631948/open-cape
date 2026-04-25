import React, { useState } from 'react';
import { Bookmark, LayoutDashboard, Search, FolderKanban, Layers, Map as MapIcon } from 'lucide-react';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { DataStatusBanner } from '@/src/components/ui/DataStatusBanner';
import { useSavedMaps } from '@/src/hooks/useSavedMaps';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/src/components/ui/Button';
import { useCompareState } from '@/src/contexts/CompareContext';

export const SavedMapsPage = () => {
  const { savedMaps, isLoading, error, deleteSavedMap } = useSavedMaps();
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCompare, isComparing, removeFromCompare } = useCompareState();
  const navigate = useNavigate();

  const filteredMaps = savedMaps.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCompareClick = (map: any) => {
    if (isComparing(map.id)) {
      removeFromCompare(map.id);
    } else {
      addToCompare({
        id: map.id,
        type: 'saved-map',
        title: map.title,
        projectId: map.projectId
      });
    }
  };

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
        <ErrorState 
          title="Couldn't load saved maps"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">Saved Maps</h1>
          <p className="text-surface-500">Your private map views, layer configurations, and Town Planning filters.</p>
        </div>
      </div>

      <DataStatusBanner variant="warning" className="max-w-xl" />

      <div className="flex bg-white p-4 rounded-xl border border-surface-200 shadow-sm relative max-w-xl">
         <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
         <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter maps..."
            className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-surface-400"
         />
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
               <div key={i} className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 h-48 flex flex-col">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
               </div>
            ))}
         </div>
      ) : filteredMaps.length === 0 ? (
         <EmptyState
            icon={MapIcon}
            title={searchQuery ? "No maps match your search" : "No saved maps yet"}
            description={searchQuery ? "" : "Explore the Cape on the interactive map and save specific views or layer setups to return to them instantly."}
            action={!searchQuery ? { label: "Go to Map Workspace", onClick: () => navigate('/app/map') } : undefined}
         />
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaps.map((map) => (
               <div key={map.id} className="group bg-white rounded-xl border border-surface-200 shadow-sm p-5 hover:shadow-md transition-shadow relative flex flex-col h-full gap-3">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-surface-400 shrink-0" />
                        <h3 className="font-semibold text-surface-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={map.title}>{map.title}</h3>
                     </div>
                  </div>
                  
                  <p className="text-sm text-surface-500 line-clamp-2 min-h-[40px]">
                     {map.description || 'No description.'}
                  </p>

                  <div className="text-xs text-surface-500 flex items-center gap-2">
                     <span className="font-mono text-[10px] bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200">
                        Z: {Math.round(map.viewport.zoom)}
                     </span>
                     <span className="font-mono text-[10px] bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200">
                        {map.visibleLayers.length} Layers
                     </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium border-t border-surface-100 pt-3 mt-auto">
                     {map.projectId ? (
                        <Link to={`/app/projects/${map.projectId}`} className="flex items-center gap-1.5 text-surface-500 hover:text-surface-900 transition-colors">
                           <FolderKanban className="h-3.5 w-3.5" />
                           View Project
                        </Link>
                     ) : (
                        <span className="text-surface-400 italic">Unassigned</span>
                     )}
                     
                     <div className="flex items-center gap-2">
                        <Button 
                          variant={isComparing(map.id) ? "secondary" : "ghost"} 
                          size="sm" 
                          className="h-6 text-[10px] px-2"
                          onClick={() => handleCompareClick(map)}
                        >
                           <Layers className="h-3 w-3 mr-1" />
                           {isComparing(map.id) ? 'Comparing' : 'Compare'}
                        </Button>
                        <Link to={`/app/map`} state={{ savedMapId: map.id }}>
                           <Button size="sm" className="h-6 text-[10px] px-4 bg-primary-600 hover:bg-primary-700 text-white">Open Map</Button>
                        </Link>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};
