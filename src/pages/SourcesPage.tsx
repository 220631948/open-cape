import React, { useState } from 'react';
import { useSourceCatalog } from '@/src/hooks/useSourceCatalog';
import { ProvenanceCard } from '@/src/components/ui/ProvenanceCard';
import { Search, Database, ShieldCheck, Server } from 'lucide-react';
import { DataStatusBanner } from '@/src/components/ui/DataStatusBanner';
import { ConnectionDashboard } from '@/src/components/ui/ConnectionDashboard';
import { Link } from 'react-router';
import { cn } from '@/src/lib/utils';

export const SourcesPage = () => {
   const { sources } = useSourceCatalog();
   const [searchQuery, setSearchQuery] = useState('');

   const filteredSources = sources.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const publicAuthoritative = filteredSources.filter(s => s.category === 'zoning' || s.category === 'cadastre');
   const openContextual = filteredSources.filter(s => s.category === 'contextual');
   const analyticalImagery = filteredSources.filter(s => s.category === 'imagery');
   const pendingCommercial = filteredSources.filter(s => s.category === 'registry' || s.category === 'market');

   return (
      <div className="bg-surface-50 min-h-full pb-20">
         <div className="bg-surface-900 border-b border-surface-800 py-16 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
            <div className="max-w-5xl mx-auto space-y-5 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-2">
                 AUTHORITATIVE PROVENANCE
               </div>
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center gap-4">
                  <Database className="h-10 w-10 text-rose-500" />
                  Verified Source Catalog
               </h1>
               <p className="text-surface-300 max-w-2xl text-lg leading-relaxed">
                  We believe in radical data transparency. Every parcel boundary, zoning right, and data point in our workspace must trace back to a verifiable source.
               </p>
               
               <div className="relative max-w-md pt-6">
                  <Search className="absolute left-4 top-1/2 mt-3 -translate-y-1/2 h-5 w-5 text-surface-400" />
                  <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search sources by name or category..."
                     className="w-full pl-12 pr-4 py-3.5 bg-surface-800/80 border border-surface-700 rounded-xl text-white placeholder:text-surface-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-lg"
                  />
               </div>
            </div>
         </div>

         <div className="max-w-5xl mx-auto px-6 py-10 space-y-16">
            <ConnectionDashboard />
            <DataStatusBanner 
               variant="warning" 
               className="max-w-3xl" 
               title="Current Catalog Status"
               description="City of Cape Town Land Parcels and Zoning are live. Some commercial and internal registry data is simulated or pending final data-access approval. Always verify source availability via the badge below."
            />
            
            <section>
               <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  Authoritative Public Sources
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {publicAuthoritative.length > 0 ? publicAuthoritative.map(source => (
                     <Link to={`/sources/${source.id}`} key={source.id} className="block group">
                        <ProvenanceCard source={source} isLive={false} className="h-full group-hover:shadow-lg transition-shadow border-surface-200" />
                     </Link>
                  )) : (
                     <p className="text-surface-500 italic text-sm">No authoritative sources match your search.</p>
                  )}
               </div>
            </section>

            <section>
               <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-500" />
                  Open Contextual Data
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {openContextual.length > 0 ? openContextual.map(source => (
                     <Link to={`/sources/${source.id}`} key={source.id} className="block group">
                        <ProvenanceCard source={source} isLive={false} className="h-full group-hover:shadow-lg transition-shadow border-surface-200" />
                     </Link>
                  )) : (
                     <p className="text-surface-500 italic text-sm">No open contextual sources match your search.</p>
                  )}
               </div>
            </section>

            <section>
               <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
                  <Server className="h-6 w-6 text-amber-500" />
                  Analytical Imagery
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analyticalImagery.length > 0 ? analyticalImagery.map(source => (
                     <Link to={`/sources/${source.id}`} key={source.id} className="block group">
                        <ProvenanceCard source={source} isLive={false} className="h-full group-hover:shadow-lg transition-shadow border-surface-200" />
                     </Link>
                  )) : (
                     <p className="text-surface-500 italic text-sm">No analytical imagery sources match your search.</p>
                  )}
               </div>
            </section>

            <section>
               <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-surface-400" />
                  Commercial & Registry Data (Simulated/Pending)
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingCommercial.length > 0 ? pendingCommercial.map(source => (
                     <Link to={`/sources/${source.id}`} key={source.id} className="block group">
                        <ProvenanceCard source={source} isLive={false} className={cn("h-full transition-all border-surface-200", source.verificationStatus === 'simulated' ? "group-hover:shadow-lg" : "opacity-70 grayscale group-hover:grayscale-0")} />
                     </Link>
                  )) : (
                     <p className="text-surface-500 italic text-sm">No pending sources match your search.</p>
                  )}
               </div>
            </section>
         </div>
      </div>
   );
};
