import React, { useState, useEffect } from "react";
import { useSourceCatalog } from "@/src/hooks/useSourceCatalog";
import { ProvenanceCard } from "@/src/components/ui/ProvenanceCard";
import { Search, Database, ShieldCheck, Server } from "lucide-react";
import { DataStatusBanner } from "@/src/components/ui/DataStatusBanner";
import { ConnectionDashboard } from "@/src/components/ui/ConnectionDashboard";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { SkeletonBlock } from "@/src/components/ui/SkeletonBlock";
import { WebGLBackground } from "@/src/components/ui/WebGLBackground";

const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-surface-900 border border-surface-800 rounded-2xl relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />
    <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center border border-surface-700 mb-6 relative z-10">
      <Server className="w-8 h-8 text-surface-500 opacity-50" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2 relative z-10">No spatial datasets found</h3>
    <p className="text-surface-400 max-w-sm relative z-10">We couldn't locate any sources matching your query. Try adjusting your search criteria or explore other categories.</p>
  </motion.div>
);

export const SourcesPage = () => {
  const { sources, isLoading, fetchSources } = useSourceCatalog();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (sources.length === 0) {
      fetchSources();
    }
  }, [fetchSources, sources.length]);

  const filteredSources = sources.filter(
    (s) =>
      s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  const publicAuthoritative = filteredSources.filter(
    (s) => s.category === "zoning" || s.category === "cadastre",
  );
  const openContextual = filteredSources.filter(
    (s) => s.category === "contextual",
  );
  const analyticalImagery = filteredSources.filter(
    (s) => s.category === "imagery",
  );
  const pendingCommercial = filteredSources.filter(
    (s) => s.category === "registry" || s.category === "market",
  );

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-900 border border-surface-800 rounded-xl p-5 h-[220px] flex flex-col justify-between overflow-hidden relative">
          <div>
            <div className="flex justify-between items-start mb-4">
               <SkeletonBlock width="60%" height="24px" rounded="sm" />
               <SkeletonBlock width="40px" height="20px" rounded="full" />
            </div>
            <SkeletonBlock lines={2} className="mt-3" />
          </div>
          <div className="flex gap-2">
             <SkeletonBlock width="70px" height="24px" rounded="full" />
             <SkeletonBlock width="90px" height="24px" rounded="full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface-950 min-h-full pb-20 relative text-surface-50 selection:bg-rose-500/30">
      <WebGLBackground className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay" />
      <div className="bg-surface-900 border-b border-surface-800 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto space-y-5 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-2">
            AUTHORITATIVE PROVENANCE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center gap-4">
            <Database className="h-10 w-10 text-rose-500" />
            Data Sources
          </h1>
          <p className="text-surface-300 max-w-2xl text-lg leading-relaxed">
            We believe in radical data transparency. Every parcel boundary,
            zoning right, and data point in our workspace must trace back to a
            verifiable source.
          </p>

          <div className="relative max-w-md pt-6">
            <Search className="absolute left-4 top-1/2 mt-3 -translate-y-1/2 h-5 w-5 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources, providers, or services"
              className="w-full pl-12 pr-4 py-3.5 bg-surface-800/80 border border-surface-700 rounded-xl text-white placeholder:text-surface-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-lg"
            />
          </div>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-16">
        <ConnectionDashboard />
        <DataStatusBanner
          variant="info"
          className="max-w-3xl"
          title="Current Catalog Status"
          description="City of Cape Town Land Parcels and Zoning are live. Commercial and internal registry data is pending final data-access approval. Always verify source availability via the badge below."
        />

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            Authoritative Public Sources
          </h2>
          {isLoading ? (
            renderSkeletons()
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {publicAuthoritative.length > 0 ? (
                  publicAuthoritative.slice(0, 6).map((source) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => navigate(`/sources/${source.id}`)}
                      key={source.id}
                      className="block group cursor-pointer"
                    >
                      <ProvenanceCard
                        source={source}
                        isLive={false}
                        className="h-full group-hover:shadow-lg transition-shadow border-surface-200"
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-500" />
            Open Contextual Data
          </h2>
          {isLoading ? (
            renderSkeletons()
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {openContextual.length > 0 ? (
                  openContextual.slice(0, 6).map((source) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => navigate(`/sources/${source.id}`)}
                      key={source.id}
                      className="block group cursor-pointer"
                    >
                      <ProvenanceCard
                        source={source}
                        isLive={false}
                        className="h-full group-hover:shadow-lg transition-shadow border-surface-200"
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
            <Server className="h-6 w-6 text-amber-500" />
            Analytical Imagery
          </h2>
          {isLoading ? (
            renderSkeletons()
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {analyticalImagery.length > 0 ? (
                  analyticalImagery.slice(0, 6).map((source) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => navigate(`/sources/${source.id}`)}
                      key={source.id}
                      className="block group cursor-pointer"
                    >
                      <ProvenanceCard
                        source={source}
                        isLive={false}
                        className="h-full group-hover:shadow-lg transition-shadow border-surface-200"
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-surface-400" />
            Commercial & Registry Data
          </h2>
          {isLoading ? (
            renderSkeletons()
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {pendingCommercial.length > 0 ? (
                  pendingCommercial.slice(0, 6).map((source) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => navigate(`/sources/${source.id}`)}
                      key={source.id}
                      className="block group cursor-pointer"
                    >
                      <ProvenanceCard
                        source={source}
                        isLive={false}
                        className="h-full transition-all border-surface-200 opacity-70 grayscale group-hover:grayscale-0"
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};
