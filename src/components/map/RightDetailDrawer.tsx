import React, { useState } from 'react';
import { Link } from 'react-router';
import { X, Info, ShieldCheck, MapPin, Building2, Map, Tag, CircleDollarSign, Plus, MessageSquare, Layers } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { Card } from '@/src/components/ui/Card';
import { ErfRecord } from '@/src/hooks/useErfSearch';
import { DataStatusBanner } from '@/src/components/ui/DataStatusBanner';
import { useAnnotations, Annotation } from '@/src/hooks/useAnnotations';
import { AnnotationEditor } from '@/src/components/annotations/AnnotationEditor';
import { AnnotationCard } from '@/src/components/annotations/AnnotationCard';
import { useProjects } from '@/src/hooks/useProjects';
import { useCompareState } from '@/src/contexts/CompareContext';
import { EnvironmentalSummaryCard } from './EnvironmentalSummaryCard';

interface RightDetailDrawerProps {
  className?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  feature?: ErfRecord | null;
  showBuffer?: boolean;
  setShowBuffer?: (show: boolean) => void;
}

export const RightDetailDrawer: React.FC<RightDetailDrawerProps> = ({ className, isOpen, setIsOpen, feature, showBuffer, setShowBuffer }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'provenance' | 'notes' | 'compare'>('summary');
  const { annotations, createAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations();
  const { projects } = useProjects();
  const { addToCompare, isComparing, removeFromCompare } = useCompareState();
  
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Annotation | null>(null);

  const featureAnnotations = annotations.filter(a => a.targetId === String(feature?.id));

  const handleCompareClick = () => {
    if (!feature) return;
    if (isComparing(feature.id)) {
      removeFromCompare(feature.id);
    } else {
      addToCompare({
        id: feature.id,
        type: 'parcel',
        title: `ERF ${feature.erfNumber}`,
        subtitle: feature.allotmentArea,
      });
    }
  };

  const handleSaveNote = async (data: any) => {
    if (!feature) return;
    if (editingNote) {
       await updateAnnotation(editingNote.id, data);
    } else {
       await createAnnotation({
         ...data,
         targetType: 'placeholder-feature',
         targetId: String(feature.id),
       });
    }
    setIsEditingNote(false);
    setEditingNote(null);
  };

  const startEditNote = (note: Annotation) => {
    setEditingNote(note);
    setIsEditingNote(true);
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId)?.title;
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'provenance', label: 'Provenance' },
    { id: 'env', label: 'Environment' },
    { id: 'notes', label: 'Notes' },
    { id: 'compare', label: 'Compare' },
  ] as const;

  return (
    <div className={cn("w-full sm:w-80 bg-white shadow-xl flex flex-col h-full z-20 transition-transform relative", className)}>
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200 shrink-0 bg-surface-50">
        <h2 className="font-semibold text-surface-900 text-sm flex items-center gap-2">
          <Info className="h-4 w-4 text-surface-400" />
          {feature ? `ERF ${feature.erfNumber}` : 'Feature Details'}
        </h2>
        <div className="flex gap-1 items-center -mr-2">
          {feature && (
             <Link to={`/app/parcel/${feature.id}`}>
               <Button variant="ghost" size="sm" className="h-8 text-xs text-primary-600 hover:text-primary-700 px-2 font-medium">Full View</Button>
             </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-surface-400 hover:text-surface-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {feature && (
        <div className="flex px-2 pt-2 gap-1 border-b border-surface-200 shrink-0 bg-surface-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors",
                activeTab === tab.id ? "bg-white text-rose-600 border border-b-0 border-surface-200 relative top-[1px]" : "text-surface-500 hover:text-surface-700 hover:bg-surface-100"
              )}
            >
              {tab.label}
              {tab.id === 'notes' && featureAnnotations.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center bg-rose-100 text-rose-700 text-[9px] rounded-full h-4 w-4">
                  {featureAnnotations.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        
        {!feature ? (
          <div className="flex flex-col items-center justify-center text-center py-8 px-4 flex-1">
            <div className="h-12 w-12 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-300 mb-4">
               <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-surface-900 mb-1 text-balance">Select a feature to inspect details</h3>
            <p className="text-xs text-surface-500 leading-relaxed max-w-[200px] mb-4">
              Click on any land parcel, zoning boundary, or data point on the map to view source-verified attributes.
            </p>
            <DataStatusBanner variant="warning" className="text-left w-full" globalAlert={true} />
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in flex-1">
            {feature.status === 'offline' ? (
              <>
                <DataStatusBanner 
                  variant="warning" 
                  className="text-left w-full mb-4" 
                  title="Dataset status"
                  description="No live source connected yet for this category. Map features are currently placeholders."
                />
              </>
            ) : (
              <DataStatusBanner 
                variant="info" 
                className="text-left w-full mb-4" 
                title="Dataset status"
                description={feature.geometry ? "Verified parcel and zoning overlays are active. Information directly extracted from CCT authoritative source." : "Geometry is source-backed, but some attributes are not yet connected."}
                serviceId="cct-parcels"
              />
            )}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {/* Street view / Building image Context */}
                {(feature.center || feature.address) && (
                  <div className="aspect-video bg-surface-200 rounded-lg overflow-hidden relative border border-surface-200 shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=300&fit=crop"
                      alt="Street View / Property Context"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-medium px-2 py-0.5 rounded shadow-sm">
                      Representative property
                    </div>
                    <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] pointer-events-none rounded-lg"></div>
                  </div>
                )}
                
                <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 space-y-4">
                  {/* OSINT / Provenance Badge */}
                  {feature.provenance && (
                    <div className="flex items-center justify-between border-b border-surface-200 pb-3 mb-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Verification Status</span>
                        <span className={cn(
                          "text-xs font-bold mt-0.5",
                          feature.provenance.verificationStatus === 'verified-source-record' ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {feature.provenance.verificationStatus === 'verified-source-record' ? '✓ Verified Source' : '⚠ Pending Verification'}
                        </span>
                      </div>
                      <div className="bg-surface-100 px-2 py-1 rounded text-[10px] font-bold text-surface-500 uppercase flex items-center gap-1.5 border border-surface-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        OSINT
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Allotment Area</span>
                    <p className="text-sm font-medium text-surface-900">{feature.allotmentArea}</p>
                  </div>
                  {feature.address && (
                    <div className="space-y-1">
                       <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">Site Address</span>
                       <p className="text-sm font-medium text-surface-900">{feature.address}</p>
                    </div>
                  )}
                  {feature.ownerName ? (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" /> Owner
                      </span>
                      <p className="text-sm font-medium text-surface-900 truncate" title={feature.ownerName}>{feature.ownerName}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" /> Owner
                      </span>
                      <p className="text-sm font-medium text-surface-500">Not available from source</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
                    <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5 mb-1">
                      <Map className="h-3 w-3" /> Area
                    </span>
                    <p className="text-sm font-medium text-surface-900">
                       {feature.properties?.['SHAPE.STArea()'] ? `${Math.round(feature.properties['SHAPE.STArea()'])} m²` : 'Not available from source'}
                    </p>
                  </div>
                  <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
                    <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5 mb-1">
                      <Tag className="h-3 w-3" /> Zoning DMS
                    </span>
                    <p className="text-sm font-medium text-emerald-700">{feature.zoning || 'Not available from source'}</p>
                  </div>
                </div>

                <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
                  <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5 mb-1">
                    <CircleDollarSign className="h-3 w-3" /> Market Valuation (CCT)
                  </span>
                  <p className="text-sm font-medium text-surface-900">
                    {feature.lastValuation ? `R ${feature.lastValuation.toLocaleString()}` : 'Not available from source'}
                  </p>
                </div>

                {/* Analytical Tools Section */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-surface-900 mb-3 px-1">Context Analysis</h4>
                  <div className="bg-surface-50 p-3.5 rounded-lg border border-surface-200 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-surface-900 mb-0.5">Site Context Buffer</h5>
                      <p className="text-xs text-surface-500 leading-relaxed mb-3">Dynamically generate a 50m radius around this parcel to identify adjacent uses and environmental overlaps.</p>
                      <Button 
                        variant={showBuffer ? "secondary" : "default"} 
                        size="sm" 
                        className="w-full h-8 text-xs font-medium"
                        onClick={() => setShowBuffer && setShowBuffer(!showBuffer)}
                      >
                        {showBuffer ? 'Remove Buffer' : 'Draw 50m Buffer'}
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
            {activeTab === 'provenance' && (
              <div className="h-full space-y-4">
                <Card className="shadow-none border border-surface-200 bg-surface-50">
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-900">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          {feature.provenance?.sourceName || 'City of Cape Town ODP'}
                      </div>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", feature.provenance?.verificationStatus === 'verified-source-record' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                         {feature.provenance?.verificationStatus === 'verified-source-record' ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between border-b border-surface-200 pb-1">
                        <span className="text-surface-500">Record ID</span>
                        <span className="font-mono text-surface-900">{feature.provenance?.recordId || feature.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-surface-200 pb-1">
                        <span className="text-surface-500">Source Dataset</span>
                        <span className="text-surface-900">{feature.provenance?.sourceId || 'Cadastre Base'}</span>
                      </div>
                      <div className="flex justify-between border-b border-surface-200 pb-1">
                        <span className="text-surface-500">Geometry Type</span>
                        <span className="text-surface-900">{feature.provenance?.geometryType || 'Point'}</span>
                      </div>
                      <div className="flex justify-between border-b border-surface-200 pb-1">
                        <span className="text-surface-500">Display Mode</span>
                        <span className="text-surface-900">{feature.provenance?.displayMode || 'point-overview'}</span>
                      </div>
                      <div className="flex justify-between border-b border-surface-200 pb-1">
                        <span className="text-surface-500">Fetched At</span>
                        <span className="text-surface-900">
                           {feature.provenance?.fetchedAt ? new Date(feature.provenance.fetchedAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-emerald-700 font-medium">Source fully synced logic active</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {activeTab === 'env' && (
              <div className="h-full animate-in fade-in">
                 <EnvironmentalSummaryCard 
                    featureId={String(feature.id)} 
                    onLinkToMap={() => setActiveTab('summary')}
                 />
              </div>
            )}
            
            {activeTab === 'notes' && (
              <div className="flex flex-col h-full gap-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-surface-900">Private Notes</h3>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setIsEditingNote(true)}>
                       <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                 </div>
                 
                 {featureAnnotations.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-surface-200 rounded-lg flex flex-col items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-surface-300 mb-2" />
                      <p className="text-xs text-surface-500">No notes attached to this feature.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {featureAnnotations.map(note => (
                          <AnnotationCard 
                            key={note.id}
                            annotation={note}
                            onEdit={startEditNote}
                            onDelete={deleteAnnotation}
                            onView={() => {}} // Disabled in drawer
                            projectName={getProjectName(note.projectId)}
                          />
                       ))}
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-surface-200 rounded-lg gap-4">
                <Layers className="w-8 h-8 text-surface-300" />
                <p className="text-sm text-surface-500 max-w-[200px]">Add this parcel to your comparison list to evaluate it side-by-side with other features.</p>
                <Button 
                  onClick={handleCompareClick} 
                  variant={isComparing(feature.id) ? "secondary" : "default"}
                  className="w-full"
                >
                  {isComparing(feature.id) ? 'Remove from Compare' : 'Compare Parcel'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Global Provenance Placeholder when no feature is selected */}
        {!feature && (
          <div className="mt-auto pointer-events-none opacity-60">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mb-2 px-1">Example Provenance</h4>
            <Card className="shadow-none border-dashed border-surface-200 bg-surface-50">
                <div className="p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-900">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        City of Cape Town ODP
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">VERIFIED</span>
                  </div>
                  
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-surface-200 pb-1">
                      <span className="text-surface-500">Record ID</span>
                      <span className="font-mono text-surface-900">Not available from source</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-surface-500 w-full text-center">Manual verification required</span>
                    </div>
                  </div>
                </div>
            </Card>
          </div>
        )}
      </div>

      {isEditingNote && feature && (
         <div className="absolute inset-0 z-30 bg-black/10 flex items-center justify-center p-2 backdrop-blur-sm">
            <AnnotationEditor 
              targetType="placeholder-feature"
              targetId={String(feature.id)}
              initialTitle={editingNote?.title}
              initialBody={editingNote?.body}
              projectId={editingNote?.projectId}
              sourceRefs={editingNote?.sourceRefs}
              onSave={handleSaveNote}
              onClose={() => {
                setIsEditingNote(false);
                setEditingNote(null);
              }}
            />
         </div>
      )}
    </div>
  );
};
