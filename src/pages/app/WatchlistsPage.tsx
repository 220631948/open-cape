import React, { useState } from 'react';
import { useWatchlists } from '@/hooks/useWatchlists';
import { Bell, Search, Plus, Trash2, Activity, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router';

export const WatchlistsPage = () => {
  const { watchlists, matchLogs, isLoading, createWatchlist, deleteWatchlist, markMatchLogRead } = useWatchlists();
  const [isCreating, setIsCreating] = useState(false);
  const [newWatchlist, setNewWatchlist] = useState({ name: '', minPrice: '', maxPrice: '', allotmentArea: '', zoning: '' });
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!newWatchlist.name) return;
    
    await createWatchlist(newWatchlist.name, {
      minPrice: newWatchlist.minPrice ? parseInt(newWatchlist.minPrice) : undefined,
      maxPrice: newWatchlist.maxPrice ? parseInt(newWatchlist.maxPrice) : undefined,
      allotmentArea: newWatchlist.allotmentArea || undefined,
      zoning: newWatchlist.zoning || undefined
    });
    
    setIsCreating(false);
    setNewWatchlist({ name: '', minPrice: '', maxPrice: '', allotmentArea: '', zoning: '' });
  };

  const handleReadAndGo = async (logId: string, erfNumber: string) => {
    await markMatchLogRead(logId);
    // Since we don't have the exact coordinates in the match log, we navigate to the map with search query
    // The MapPage needs to rely on search to locate the ERF. Or we could just use Algolia search on MapPage.
    // Let's pass the state over:
    navigate('/app/map', { state: { queryErfNumber: erfNumber } });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
         <div className="flex items-center gap-2 text-surface-500">
            <Activity className="h-5 w-5 animate-pulse" /> Loading Watchlists...
         </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-surface-50 z-0 p-8 h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
               <Bell className="h-6 w-6 text-rose-500" /> Watchlists & Alerts
            </h1>
            <p className="text-sm text-surface-500 mt-1">Receive notifications when properties matching your criteria hit the market or update.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
             <Plus className="h-4 w-4" /> New Watchlist
          </Button>
        </div>

        {isCreating && (
          <Card className="p-6 border-rose-200 shadow-sm animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">Create New Watchlist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-semibold text-surface-500 mb-1 block uppercase tracking-wider">Watchlist Name</label>
                  <Input 
                    placeholder="e.g. Camps Bay Luxury" 
                    value={newWatchlist.name}
                    onChange={(e) => setNewWatchlist({...newWatchlist, name: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold text-surface-500 mb-1 block uppercase tracking-wider">Allotment Area</label>
                  <Input 
                    placeholder="e.g. CAMPS BAY" 
                    value={newWatchlist.allotmentArea}
                    onChange={(e) => setNewWatchlist({...newWatchlist, allotmentArea: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold text-surface-500 mb-1 block uppercase tracking-wider">Min Price (R)</label>
                  <Input 
                    type="number"
                    placeholder="2000000" 
                    value={newWatchlist.minPrice}
                    onChange={(e) => setNewWatchlist({...newWatchlist, minPrice: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold text-surface-500 mb-1 block uppercase tracking-wider">Max Price (R)</label>
                  <Input 
                    type="number"
                    placeholder="5000000" 
                    value={newWatchlist.maxPrice}
                    onChange={(e) => setNewWatchlist({...newWatchlist, maxPrice: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold text-surface-500 mb-1 block uppercase tracking-wider">Zoning</label>
                  <Input 
                    placeholder="e.g. SR1" 
                    value={newWatchlist.zoning}
                    onChange={(e) => setNewWatchlist({...newWatchlist, zoning: e.target.value})}
                  />
               </div>
            </div>
            <div className="mt-6 flex gap-3">
               <Button onClick={handleCreate} disabled={!newWatchlist.name} className="bg-rose-600 hover:bg-rose-700">Save Watchlist</Button>
               <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6 md:col-span-1">
             <h3 className="text-lg font-semibold text-surface-900 border-b border-surface-200 pb-2">Your Watchlists</h3>
             {watchlists.length === 0 ? (
               <div className="text-center py-6 bg-white border border-dashed border-surface-200 rounded-lg">
                 <p className="text-sm text-surface-500">No watchlists configured.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {watchlists.map(wl => (
                   <div key={wl.id} className="bg-white p-4 border border-surface-200 rounded-lg shadow-sm hover:border-surface-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-surface-900">{wl.name}</h4>
                        <button onClick={() => deleteWatchlist(wl.id)} className="text-surface-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-1 text-xs text-surface-500">
                         {wl.filters.allotmentArea && <div><span className="font-medium">Area:</span> {wl.filters.allotmentArea}</div>}
                         {wl.filters.zoning && <div><span className="font-medium">Zoning:</span> {wl.filters.zoning}</div>}
                         {(wl.filters.minPrice || wl.filters.maxPrice) && (
                           <div>
                             <span className="font-medium">Price:</span> R {wl.filters.minPrice?.toLocaleString() || '0'} - {wl.filters.maxPrice ? `R ${wl.filters.maxPrice.toLocaleString()}` : 'Any'}
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          <div className="space-y-6 md:col-span-2">
             <h3 className="text-lg font-semibold text-surface-900 border-b border-surface-200 pb-2">Recent Match Alerts</h3>
             {matchLogs.length === 0 ? (
               <div className="text-center py-12 bg-white border border-surface-200 rounded-lg">
                 <Search className="h-8 w-8 text-surface-300 mx-auto mb-2" />
                 <p className="text-sm text-surface-500">No alerts yet. We'll notify you when new properties match your watchlists.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {matchLogs.map(log => {
                   const matchedWatchlist = watchlists.find(w => w.id === log.watchlistId);
                   return (
                     <div key={log.id} className={cn(
                       "p-4 border rounded-lg flex items-center justify-between transition-colors",
                       !log.read ? "bg-rose-50 border-rose-200" : "bg-white border-surface-200"
                     )}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <div className={cn("h-2 w-2 rounded-full", !log.read ? "bg-rose-500" : "bg-surface-300")} />
                             <span className="text-xs font-semibold text-surface-500 uppercase tracking-widest">{matchedWatchlist?.name || 'Unknown Watchlist'}</span>
                          </div>
                          <h4 className="text-base font-semibold text-surface-900">ERF {log.erfNumber} in {log.allotmentArea}</h4>
                          <p className="text-xs text-surface-500 mt-1">Matched on {new Date(log.matchedAt).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleReadAndGo(log.id, log.erfNumber)} className="gap-2">
                          <MapPin className="h-4 w-4" /> View Map
                        </Button>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
