import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Map, FolderKanban, ShieldCheck, Layers, RefreshCw } from 'lucide-react';
import { useBookmarks } from '@/src/hooks/useBookmarks';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { Link } from 'react-router';
import { useCompareState } from '@/src/contexts/CompareContext';
import { Button } from '@/src/components/ui/Button';
import { getLiveErfRecord } from '@/src/source_connectors/cctOpenDataClient';

const LiveBookmarkItem = ({ bookmark, onCompareClick, isComparing }: any) => {
   const [liveData, setLiveData] = useState<any>(null);
   const [isUpgrading, setIsUpgrading] = useState(false);

   useEffect(() => {
      // Auto-upgrade check logic
      if (bookmark.type === 'feature' && bookmark.featureRef?.id?.startsWith('cct-')) {
         setLiveData({ id: bookmark.featureRef.id, status: 'live' }); // Already live
      } else if (bookmark.type === 'map-state' && bookmark.mapState) {
         // Auto upgrade attempt
         setIsUpgrading(true);
         getLiveErfRecord(bookmark.mapState.lng, bookmark.mapState.lat)
            .then(res => {
               if (res) setLiveData(res);
            })
            .catch(() => {})
            .finally(() => setIsUpgrading(false));
      }
   }, [bookmark]);

   return (
      <div className="group bg-white rounded-xl border border-surface-200 shadow-sm p-5 hover:shadow-md transition-shadow relative flex flex-col h-full gap-3">
         <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
               <Bookmark className={`h-4 w-4 shrink-0 ${liveData ? 'text-emerald-500' : 'text-surface-400'}`} />
               <h3 className={`font-semibold transition-colors line-clamp-1 ${liveData ? 'text-emerald-800' : 'text-surface-900'}`} title={bookmark.label}>{bookmark.label}</h3>
               {isUpgrading && <RefreshCw className="h-3 w-3 text-surface-400 animate-spin" />}
            </div>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${liveData ? 'bg-emerald-100 text-emerald-700' : 'text-surface-400 bg-surface-100'}`}>
               {liveData ? 'LIVE PARCEL' : bookmark.type}
            </span>
         </div>
         
         <p className="text-sm text-surface-500 line-clamp-2 min-h-[40px]">
            {bookmark.notes || 'No notes.'}
         </p>
         
         <div className="flex items-center justify-between text-xs font-medium border-t border-surface-100 pt-3 mt-auto">
            {bookmark.projectId ? (
               <Link to={`/app/projects/${bookmark.projectId}`} className="flex items-center gap-1.5 text-surface-500 hover:text-surface-900 transition-colors">
                  <FolderKanban className="h-3.5 w-3.5" />
                  View Project
               </Link>
            ) : (
               <span className="text-surface-400 italic">Unassigned</span>
            )}
            
            <div className="flex items-center gap-2">
               <Button 
                 variant={isComparing(bookmark.id) ? "secondary" : "ghost"} 
                 size="sm" 
                 className="h-6 text-[10px] px-2"
                 onClick={() => onCompareClick(bookmark)}
               >
                 <Layers className="h-3 w-3 mr-1" />
                 {isComparing(bookmark.id) ? 'Comparing' : 'Compare'}
               </Button>
               {liveData ? (
                  <Link to={`/app/parcel/${liveData.id}`}>
                     <Button size="sm" className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white">Open Parcel</Button>
                  </Link>
               ) : (
                  <Link to={`/app/map`} state={bookmark.mapState ? { focusErf: { center: bookmark.mapState } } : undefined}>
                     <Button size="sm" className="h-6 text-[10px] px-2 bg-primary-600 hover:bg-primary-700 text-white">Open Map</Button>
                  </Link>
               )}
            </div>
         </div>
      </div>
   );
};

export const BookmarksPage = () => {
   const { bookmarks, isLoading, error } = useBookmarks();
   const [searchQuery, setSearchQuery] = useState('');
   const { addToCompare, isComparing, removeFromCompare } = useCompareState();

   const filteredBookmarks = bookmarks.filter(b => b.label.toLowerCase().includes(searchQuery.toLowerCase()));

   const handleCompareClick = (bookmark: any) => {
      if (isComparing(bookmark.id)) {
         removeFromCompare(bookmark.id);
      } else {
         addToCompare({
            id: bookmark.id,
            type: 'bookmark',
            title: bookmark.label,
            subtitle: bookmark.notes,
            projectId: bookmark.projectId
         });
      }
   };

   if (error) {
      return (
         <div className="p-8 max-w-4xl mx-auto flex justify-center">
            <ErrorState title="Failed to load bookmarks" description={error} />
         </div>
      );
   }

   return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 h-full overflow-y-auto">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-2xl font-semibold text-surface-900 tracking-tight">Bookmarks</h1>
               <p className="text-surface-500 text-sm mt-1">Quick links to saved map views and properties.</p>
            </div>
         </div>

         <div className="flex bg-white p-4 rounded-xl border border-surface-200 shadow-sm relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Filter bookmarks..."
               className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-surface-400"
            />
         </div>

         <div className="max-w-2xl text-[11px] text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-start gap-2 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span><strong>Authoritative Provenance:</strong> Property records are now linked directly to the City of Cape Town and Western Cape Spatial Data Warehouse. Bookmarks automatically synchronize with live source IDs for verified parcels.</span>
         </div>

         {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 h-40 flex flex-col">
                     <Skeleton className="h-6 w-3/4 mb-4" />
                     <Skeleton className="h-4 w-full mb-2" />
                  </div>
               ))}
            </div>
         ) : filteredBookmarks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-surface-300">
               <div className="h-16 w-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
                  <Bookmark className="h-8 w-8 text-surface-400" />
               </div>
               <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {searchQuery ? 'No bookmarks match your filter' : 'No bookmarks yet'}
               </h3>
               <p className="text-surface-500 text-balance max-w-sm mb-4">
                  {searchQuery ? '' : 'Bookmark a map view or verified feature to find it faster later.'}
               </p>
               <Link to="/app/map" className="text-rose-600 font-medium text-sm hover:underline">
                  Go to Map Workspace
               </Link>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredBookmarks.map((bookmark) => (
                  <LiveBookmarkItem 
                    key={bookmark.id} 
                    bookmark={bookmark} 
                    onCompareClick={handleCompareClick} 
                    isComparing={isComparing} 
                  />
               ))}
            </div>
         )}
      </div>
   );
};
