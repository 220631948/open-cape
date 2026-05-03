import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Map as MapIcon, ChevronRight, Layers, Home, Info, BookOpen, Bookmark, FolderPlus, MapPin, Maximize, ShieldCheck } from 'lucide-react';
import { DataStatusBanner } from '@/src/components/ui/DataStatusBanner';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { ProvenanceCard } from '@/src/components/ui/ProvenanceCard';
import { AddBookmarkDialog } from '@/src/components/map/AddBookmarkDialog';
import { useCompareState } from '@/src/contexts/CompareContext';
import { getLiveErfRecordById } from '@/src/source_connectors/cctOpenDataClient';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Badge } from '@/src/components/ui/Badge';

export const ParcelDetailPage = () => {
  const { parcelId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const { addToCompare, isComparing, removeFromCompare } = useCompareState();

  const [parcelData, setParcelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (parcelId && parcelId.startsWith('cct-')) {
      const objectId = parcelId.replace('cct-', '');
      getLiveErfRecordById(objectId).then(data => {
        setParcelData(data);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [parcelId]);

  const handleCompareClick = () => {
    if (!parcelId) return;
    if (isComparing(parcelId)) {
      removeFromCompare(parcelId);
    } else {
      addToCompare({
        id: parcelId,
        type: 'parcel',
        title: parcelData?.erfNumber ? `ERF ${parcelData.erfNumber}` : `Parcel ${parcelId}`,
      });
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'zoning', label: 'Zoning & Land Use' },
    { id: 'planning', label: 'Planning & Development' },
    { id: 'market', label: 'Market & Valuation' },
    { id: 'context', label: 'Context & Accessibility' },
    { id: 'provenance', label: 'Provenance' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-sm text-surface-500 mb-1">
                <Link to="/app/map" className="hover:text-surface-900 transition-colors">Map</Link>
                <ChevronRight className="w-4 h-4 mx-1" />
                <Link to={`/app/areas/${parcelData?.allotmentArea || 'area'}`} className="hover:text-surface-900 transition-colors">{parcelData ? parcelData.allotmentArea : 'Area'}</Link>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span>Parcel {parcelData ? parcelData.erfNumber : (isLoading ? '(Loading)' : parcelId)}</span>
              </div>
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-2 mb-1">
                <MapIcon className="w-6 h-6 text-primary-600" />
                {isLoading ? <Skeleton className="h-8 w-48" /> : (parcelData?.erfNumber ? `ERF ${parcelData.erfNumber}` : 'Unknown Parcel')}
                {!isLoading && parcelData && <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none font-mono text-xs">LIVE RECORD</Badge>}
              </h1>
              <div className="text-surface-500 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4" /> 
                {isLoading ? <Skeleton className="h-4 w-64 inline-block" /> : (parcelData?.address || "Address not available from source")}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={isComparing(parcelId!) ? "secondary" : "outline"} 
                size="sm" 
                onClick={handleCompareClick}
              >
                <Layers className="w-4 h-4 mr-2" />
                {isComparing(parcelId!) ? 'Remove from Compare' : 'Compare'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBookmarkDialogOpen(true)}>
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark Parcel
              </Button>
              <Button variant="outline" size="sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                Link to Project
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
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
            sourceId="cct-parcels"
            description={parcelData ? "Live parcel data is loaded via CCT Open Data. Attributes are subject to confirmation." : "Dataset status: Live connection establishing..."}
          />

          {isLoading ? (
            <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
          ) : activeTab === 'summary' && (
            <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm">
              <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-surface-400" />
                Parcel Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-surface-500">Parcel Identifier</dt>
                  <dd className="mt-1 text-sm text-surface-900 font-mono bg-surface-100 px-2 py-1 rounded inline-block">{parcelData ? parcelData.id : 'Not available from source'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-surface-500">Address / Locality</dt>
                  <dd className="mt-1 text-sm text-surface-900">{parcelData?.address || <span className="italic text-surface-400">Not available from source</span>}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-surface-500">Area / Suburb</dt>
                  <dd className="mt-1 text-sm text-surface-900 mt-1">{parcelData?.allotmentArea || <span className="italic text-surface-400">Not available from source</span>}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-surface-500">Parcel Size</dt>
                  <dd className="mt-1 text-sm text-surface-900">
                     {parcelData?.properties?.SHAPE_Area ? `${Math.round(parcelData.properties.SHAPE_Area)} m²` : <span className="italic text-surface-400">Not available from source</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-surface-500">Current Zoning</dt>
                  <dd className="mt-1 text-sm text-surface-900 font-semibold text-emerald-700">
                    {parcelData?.zoning || <span className="italic text-surface-400">Not available from source</span>}
                  </dd>
                </div>
              </div>
            </div>
          )}

          {!isLoading && activeTab === 'zoning' && (
            <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3 text-emerald-800 text-sm">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-bold">Authoritative Zoning Record</p>
                  <p className="opacity-90">Extracted from CCT Development Management Scheme (DMS). Use for contextual analysis only.</p>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-surface-400" />
                Zoning & Land Use Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                 <div>
                  <dt className="text-sm font-medium text-surface-500">Zoning Designation</dt>
                  <dd className="mt-1 text-sm font-bold text-emerald-700">{parcelData?.zoning || <span className="italic text-surface-400">Not available from source</span>}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-surface-500">Category</dt>
                  <dd className="mt-1 text-sm text-surface-900">{parcelData?.zoningCategory || <span className="italic text-surface-400">Not available from source</span>}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-surface-500">Primary Code</dt>
                  <dd className="mt-1 text-sm text-surface-900 font-mono">{parcelData?.zoningFeature?.properties?.CODE_DESC || parcelData?.zoningFeature?.properties?.ZON_SCHM || <span className="italic text-surface-400">Not available</span>}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-surface-500">Zoning Scheme</dt>
                  <dd className="mt-1 text-sm text-surface-900">{parcelData?.zoningFeature?.properties?.ZON_SCHM || 'Cape Town DMS'}</dd>
                </div>
                {parcelData?.zoningFeature?.properties?.OPW_DESC && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-surface-500">Overlay Zones / Policy Context</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {parcelData.zoningFeature.properties.OPW_DESC.split(';').map((overlay: string) => (
                        <Badge key={overlay} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                          {overlay.trim()}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2 pt-4 border-t border-surface-100">
                  <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-3">Permitted Use Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
                      <span className="text-[10px] font-bold text-surface-500 uppercase">Primary Uses</span>
                      <p className="text-xs text-surface-600 mt-1">Derived from {parcelData?.zoningCategory || 'zoning'} policy. Consult the full DMS document for specifics.</p>
                    </div>
                    <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
                      <span className="text-[10px] font-bold text-surface-500 uppercase">Consent Uses</span>
                      <p className="text-xs text-surface-600 mt-1">Additional activities may require municipal approval or departures.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm flex flex-col items-center py-12 text-center">
              <BookOpen className="w-12 h-12 text-surface-300 mb-4" />
              <h3 className="text-lg font-semibold text-surface-900">Planning & Development</h3>
              <p className="text-surface-500 max-w-md">
                Planning case data, development activity, and application history will appear here once a verified source is connected.
              </p>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-6 shadow-sm flex flex-col items-center py-12 text-center">
              <Home className="w-12 h-12 text-surface-300 mb-4" />
              <h3 className="text-lg font-semibold text-surface-900">Market & Valuation</h3>
              <p className="text-surface-500 max-w-md">
                Explicitly no market data connected yet. No price ranges, averages, or estimates.
              </p>
            </div>
          )}

          {activeTab === 'context' && (
             <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-8 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-6">
                    <MapIcon className="w-5 h-5 text-surface-400" />
                    Context Analysis
                  </h2>
                  
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-violet-900 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Site Context Buffer Tool
                      </h3>
                      <p className="text-sm text-violet-700">Dynamically draw a 50m bounding radius around this parcel to visualize adjacent uses and constraints.</p>
                    </div>
                    <Button 
                      className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white"
                      disabled={!parcelData?.geometry}
                      onClick={() => navigate('/app/map', { state: { focusErf: parcelData, showBuffer: true } })}
                    >
                      <Maximize className="w-4 h-4 mr-2" />
                      View Buffer on Map
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-surface-200">
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Proximity Indicators</dt>
                    <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Amenities</dt>
                    <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Transport Node Access</dt>
                    <dd className="mt-1 text-sm text-surface-900 mt-1">Not available from source</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-surface-500">Environmental Context</dt>
                    <dd className="mt-1 text-sm text-surface-900">Not available from source</dd>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'provenance' && (
            <div className="space-y-6">
              <ProvenanceCard 
                source={{
                  id: "cct-odp-parcels",
                  sourceId: "cct-odp-parcels",
                  name: "Cape Town Open Data Portal - Parcels",
                  websiteUrl: "https://odp-cctegis.opendata.arcgis.com/",
                  category: 'cadastre',
                  coverage: 'City of Cape Town',
                  isPublic: true,
                  purposeDesc: 'Used for live rendering.',
                  licenseNote: "CCT Open Data License",
                  qualityBadge: "verified"
                }}
              />
            </div>
          )}

        </div>
      </main>

      <AddBookmarkDialog 
        isOpen={bookmarkDialogOpen} 
        onClose={() => setBookmarkDialogOpen(false)} 
        currentFeatureId={parcelId}
      />
    </div>
  );
};
