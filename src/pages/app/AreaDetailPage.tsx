import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Map as MapIcon, ChevronRight, Activity, BookOpen, Layers, Info, FolderPlus, Bookmark } from 'lucide-react';
import { DataStatusBanner } from '@/src/components/ui/DataStatusBanner';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { ProvenanceCard } from '@/src/components/ui/ProvenanceCard';
import { AddBookmarkDialog } from '@/src/components/map/AddBookmarkDialog';
import { useCompareState } from '@/src/contexts/CompareContext';
import { EnvironmentalSummaryCard } from '@/src/components/map/EnvironmentalSummaryCard';

export const AreaDetailPage = () => {
  const { areaId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const { addToCompare, isComparing, removeFromCompare } = useCompareState();

  const handleCompareClick = () => {
    if (!areaId) return;
    if (isComparing(areaId)) {
      removeFromCompare(areaId);
    } else {
      addToCompare({
        id: areaId,
        type: 'area',
        title: areaId.replace('-', ' '),
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'planning', label: 'Planning & Policy' },
    { id: 'market', label: 'Market Signals' },
    { id: 'env', label: 'Environmental Analysis' },
    { id: 'infrastructure', label: 'Infrastructure & Services' },
    { id: 'projects', label: 'Projects & Activity' },
    { id: 'provenance', label: 'Provenance' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-50">
      <header className="bg-white border-b border-surface-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-sm text-surface-500 mb-1">
                <Link to="/app/areas" className="hover:text-surface-900 transition-colors">Areas</Link>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span>Area Analysis</span>
              </div>
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-2 capitalize">
                <MapIcon className="w-6 h-6 text-primary-600" />
                {areaId?.replace('-', ' ')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={isComparing(areaId!) ? "secondary" : "outline"} 
                size="sm" 
                onClick={handleCompareClick}
              >
                <Layers className="w-4 h-4 mr-2" />
                {isComparing(areaId!) ? 'Remove from Compare' : 'Compare'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBookmarkDialogOpen(true)}>
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark target (placeholder)
              </Button>
              <Button variant="outline" size="sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                Link to Project
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 border-t border-surface-200 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <DataStatusBanner 
            status="Dataset status: Live data is available from authoritative sources. Analytical layers provide environmental context."
          />

          {activeTab === 'overview' && (
             <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm">
               <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                 <Info className="w-5 h-5 text-surface-400" />
                 Area Overview
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <dt className="text-sm font-medium text-surface-500">Area Name</dt>
                   <dd className="mt-1 text-sm text-surface-900 capitalize">{areaId?.replace('-', ' ')}</dd>
                 </div>
                 <div>
                   <dt className="text-sm font-medium text-surface-500">Description</dt>
                   <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                 </div>
                 <div>
                   <dt className="text-sm font-medium text-surface-500">Boundary Context</dt>
                   <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                 </div>
                 <div>
                   <dt className="text-sm font-medium text-surface-500">Population & Density</dt>
                   <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'planning' && (
            <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm flex flex-col items-center py-12 text-center">
              <BookOpen className="w-12 h-12 text-surface-300 mb-4" />
              <h3 className="text-lg font-semibold text-surface-900">Planning & Policy</h3>
              <p className="text-surface-500 max-w-md">
                Zoning patterns, policy overlays, and development frameworks will appear here once verified sources interact with this placeholder.
              </p>
            </div>
          )}

          {activeTab === 'market' && (
             <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm flex flex-col items-center py-12 text-center">
               <Activity className="w-12 h-12 text-surface-300 mb-4" />
               <h3 className="text-lg font-semibold text-surface-900">Market Signals</h3>
               <p className="text-surface-500 max-w-md">
                 <strong>No market source connected yet.</strong> Placeholders for listing activity, transfer trends, and val summaries will be configured once verified integrations exist.
               </p>
             </div>
          )}

          {activeTab === 'env' && (
             <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm">
                <EnvironmentalSummaryCard featureId={areaId} />
             </div>
          )}

          {activeTab === 'infrastructure' && (
             <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm">
                <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-surface-400" />
                  Infrastructure & Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Transport Links</dt>
                    <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Schools & Clinics</dt>
                    <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Utilities</dt>
                    <dd className="mt-1 text-sm text-surface-900 mt-1">Not available from source</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Public Facilities</dt>
                    <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'projects' && (
             <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm flex flex-col items-center py-12 text-center">
                <FolderPlus className="w-12 h-12 text-surface-300 mb-4" />
                <h3 className="text-lg font-semibold text-surface-900">Projects & Activity</h3>
                <p className="text-surface-500 max-w-md">
                  No linked user projects, saved maps, or drawings found for this placeholder area. Features will populate once connected by user workflows.
                </p>
             </div>
          )}

          {activeTab === 'provenance' && (
            <div className="space-y-6">
              <ProvenanceCard 
                sourceId="placeholder"
                name="No verified sources connected yet."
                url="#"
                retrievedDate="N/A"
                verifiedDate="N/A"
                license="No License"
                qualityBadge="unknown"
              />
            </div>
          )}

        </div>
      </main>

      <AddBookmarkDialog 
        isOpen={bookmarkDialogOpen} 
        onClose={() => setBookmarkDialogOpen(false)} 
        currentFeatureId={areaId}
      />
    </div>
  );
};
