import React, { useState } from 'react';
import { Link } from 'react-router';
import { X, Info, ShieldCheck, MapPin, Building2, Map, Tag, CircleDollarSign, Plus, MessageSquare, Layers, CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, scrubPopiaData } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { ErfRecord } from '@/hooks/useErfSearch';
import { DataStatusBanner } from '@/components/ui/DataStatusBanner';
import { useAnnotations, Annotation } from '@/hooks/useAnnotations';
import { AnnotationEditor } from '@/components/annotations/AnnotationEditor';
import { AnnotationCard } from '@/components/annotations/AnnotationCard';
import { useProjects } from '@/hooks/useProjects';
import { useCompareState } from '@/contexts/CompareContext';
import { ValuationTrendChart } from '@/components/charts/ValuationTrendChart';
import { TransactionTimeline } from '@/components/history/TransactionTimeline';
import { EstimatedValuePanel } from '@/components/valuation/EstimatedValuePanel';
import { RentalEstimatePanel } from '@/components/rentals/RentalEstimatePanel';
import { OwnershipChangeAlert } from '@/components/ownership/OwnershipChangeAlert';
import { PropertyRiskPanel } from '@/components/risk/PropertyRiskPanel';
import { calculatePropertyValuation } from '@/services/valuationService';
import { getTransactionHistory, getValuationTrends } from '@/services/historyService';
import { detectOwnershipChange } from '@/services/ownershipService';
import { useRentalEstimate } from '@/hooks/useRentalEstimate';
import { usePropertyRisk } from '@/hooks/usePropertyRisk';
import { useTransactionAnomalies } from '@/hooks/useTransactionAnomalies';
import { useMarketSegments } from '@/hooks/useMarketSegments';
import { usePriceForecast } from '@/hooks/usePriceForecast';
import { TransactionAnomalyPanel } from '@/components/transactions/TransactionAnomalyPanel';
import { MarketSegmentsPanel } from '@/components/segments/MarketSegmentsPanel';
import { ForecastPanel } from '@/components/forecast/ForecastPanel';
import { EnvironmentalSummaryCard } from './EnvironmentalSummaryCard';
import { InsightPanel } from '@/components/ai/InsightPanel';
import { PriceForecastChart } from '@/components/charts/PriceForecastChart';
import { FileStack, ChevronRight } from 'lucide-react';

interface RightDetailDrawerProps {
  className?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  feature?: ErfRecord | null;
  showBuffer?: boolean;
  setShowBuffer?: (show: boolean) => void;
}

export const RightDetailDrawer: React.FC<RightDetailDrawerProps> = ({ className, isOpen, setIsOpen, feature, showBuffer, setShowBuffer }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'provenance' | 'env' | 'notes' | 'compare'>('overview');
  const { annotations, createAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations();
  const { projects } = useProjects();
  const { addToCompare, isComparing, removeFromCompare } = useCompareState();
  
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Annotation | null>(null);

  const featureAnnotations = annotations.filter(a => a.targetId === String(feature?.id));

  // Rental Estimate Calculation
  const rentalEstimate = useRentalEstimate({
    parcelAreaSqm: feature?.properties?.['SHAPE.STArea()'],
    zoning: feature?.zoning,
    municipality: feature?.municipality,
    propertyType: feature?.propertyType,
    bedrooms: feature?.bedrooms,
    municipalValuation: feature?.landValue || feature?.lastValuation,
    disabled: !feature
  });

  // Property Risk Evaluation
  const propertyRisk = usePropertyRisk({
    floodHazardArea: feature?.floodHazardArea || false, // Derived from intersections
    distanceToCoast: feature?.distanceToCoast || null,
    zoningCompliance: typeof feature?.zoningCompliance !== 'undefined' ? feature?.zoningCompliance : null,
    planningRestrictions: feature?.planningRestrictions || [],
    disabled: !feature
  });

  // Transaction Anomalies Evaluation
  const anomalyResult = useTransactionAnomalies({
    transactionHistory: feature?.transactionHistory,
    localComparableMedianPrice: feature?.lastValuation, // Proxy for local comp median here
    disabled: !feature || !feature.transactionHistory || feature.transactionHistory.length === 0
  });

  // Market Segmentation Evaluation
  const marketSegment = useMarketSegments({
    areaSqm: feature?.properties?.['SHAPE.STArea()'],
    zoning: feature?.zoning,
    distanceToCoast: feature?.distanceToCoast,
    valuation: feature?.landValue || feature?.lastValuation,
    municipality: feature?.municipality,
    disabled: !feature
  });

  // Price Forecasting Evaluation
  const priceForecast = usePriceForecast({
    transactions: feature?.transactionHistory,
    currentValuation: feature?.landValue || feature?.lastValuation,
    marketSegment: marketSegment?.segment,
    municipality: feature?.municipality,
    propertyRiskScore: propertyRisk?.totalScore,
    disabled: !feature
  });

  // Valuation Evaluation
  const valuationResult = typeof feature?.estimatedValueAvm !== 'undefined' ? {
    estimatedValue: feature.estimatedValueAvm,
    confidenceScore: typeof feature.avmConfidenceScore === 'number' ? feature.avmConfidenceScore : feature.avmConfidenceScore === 'High' ? 90 : feature.avmConfidenceScore === 'Medium' ? 60 : 30,
    confidenceCategory: (typeof feature.avmConfidenceScore === 'string' ? feature.avmConfidenceScore : feature.avmConfidenceScore && feature.avmConfidenceScore >= 80 ? 'High' : feature.avmConfidenceScore && feature.avmConfidenceScore >= 50 ? 'Moderate' : 'Low') as 'High' | 'Moderate' | 'Low',
    valuationMethod: 'Automated Valuation Model',
    valuationTimestamp: feature.updatedAt || new Date().toISOString(),
    rentalEstimate: feature.estimatedValueAvm ? Math.round(feature.estimatedValueAvm * 0.006) : undefined, // ~0.6% rule
    marketSegment: marketSegment?.segment || "General",
    keyDrivers: (marketSegment?.drivers?.map(d => typeof d === 'string' ? d : JSON.stringify(d)) as string[]) || ["Location", "Zoning"]
  } : {
    ...calculatePropertyValuation(
      feature?.properties?.['SHAPE.STArea()'] || 0,
      feature?.zoning,
      feature?.municipality,
      [], // Dummy, ideally fetch from sales
      feature?.landValue || feature?.lastValuation || 0,
      feature?.improvementValue || 0
    ),
    rentalEstimate: (feature?.landValue || feature?.lastValuation || 0) > 0 ? Math.round((feature?.landValue || feature?.lastValuation || 0) * 0.007) : undefined,
    marketSegment: marketSegment?.segment || "General",
    keyDrivers: (marketSegment?.drivers?.map(d => typeof d === 'string' ? d : JSON.stringify(d)) as string[]) || ["Size", "Zoning constraints"]
  };

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
        projectId: null,
      });
    }
  };

  const handleSaveNote = async (data: { title: string; body: string; projectId: string | null; sourceRefs: string[] }) => {
    if (!feature) return;
    if (editingNote) {
       await updateAnnotation(editingNote.id, {
         title: data.title,
         body: data.body,
         projectId: data.projectId || null,
         sourceRefs: data.sourceRefs
       });
    } else {
       await createAnnotation({
         title: data.title,
         body: data.body,
         projectId: data.projectId || null,
         sourceRefs: data.sourceRefs,
         targetType: 'parcel',
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
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.title;
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'market', label: 'Market & Valuation' },
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
            aria-label="Close details"
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
                  description="No live source connected yet for this category."
                />
              </>
            ) : feature.status === 'geocode' ? (
              <DataStatusBanner 
                variant="info" 
                className="text-left w-full mb-4" 
                title="Geocoding Match"
                description="This pin represents a location coordinate or address match. No specific parcel geometry from the authoritative source could be found here."
              />
            ) : (
              <DataStatusBanner 
                variant="info" 
                className="text-left w-full mb-4" 
                title="Dataset status"
                description={feature.geometry ? "Verified parcel and zoning overlays are active. Information directly extracted from authoritative source." : "Geometry is source-backed, but some attributes are not yet connected."}
                sourceId="cct-parcels"
              />
            )}
            
            {/* AI Insight Panel */}
            <InsightPanel 
              feature={feature} 
              valuationResult={valuationResult}
              riskAssessment={propertyRisk}
            />

            {/* Spatial Analysis - Buffer */}
            {setShowBuffer && (
              <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-surface-900 flex items-center gap-1.5">
                    <CircleDashed className="w-4 h-4 text-violet-500" />
                    Spatial Analysis
                  </h4>
                  <p className="text-xs text-surface-500 mt-0.5">50m Buffer: {showBuffer ? 'Active' : 'Inactive'}</p>
                </div>
                <Button 
                  variant={showBuffer ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setShowBuffer(!showBuffer)}
                  className={cn(showBuffer && "bg-violet-600 hover:bg-violet-700")}
                >
                  {showBuffer ? 'Hide Buffer' : 'Show Buffer'}
                </Button>
              </div>
            )}

            {activeTab === 'overview' && (
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
                    {/* Ownership & Tenure */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
                           <Building2 className="h-3 w-3" /> Ownership Details
                         </span>
                         <span className="text-[8px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1 border border-emerald-100 rounded">POPIA Compliant</span>
                      </div>
                      
                      {feature.transactionHistory && detectOwnershipChange(feature.transactionHistory, feature.ownerType, feature.ownershipCategory) !== null && (
                         <OwnershipChangeAlert event={detectOwnershipChange(feature.transactionHistory, feature.ownerType, feature.ownershipCategory)} className="mb-2 mt-2" />
                      )}

                      {feature.ownerName ? (
                         <div className="space-y-1 mt-1">
                            <p className="text-sm font-medium text-surface-900 truncate" title={scrubPopiaData(feature.ownerName) || ''}>{scrubPopiaData(feature.ownerName)}</p>
                            <div className="text-[10px] text-surface-500 font-medium">Record type: {feature.ownerType || 'Individual/Entity'} {feature.ownershipCategory ? `• ${feature.ownershipCategory}` : ''}</div>
                         </div>
                      ) : (
                         <p className="text-sm font-medium text-surface-500 mt-1">Restricted or not available</p>
                      )}
                      {feature.lastOwnershipChangeDate && (
                         <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                               "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                               new Date(feature.lastOwnershipChangeDate) > new Date(Date.now() - 24 * 30 * 24 * 60 * 60 * 1000) ? "bg-blue-100 text-blue-700" : "bg-surface-100 text-surface-600"
                            )}>
                               {new Date(feature.lastOwnershipChangeDate) > new Date(Date.now() - 24 * 30 * 24 * 60 * 60 * 1000) ? 'Recent Transfer' : 'Long-term Tenure'}
                            </span>
                         </div>
                      )}
                    </div>
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
                      <p className="text-[11px] font-bold text-emerald-800">{feature.zoningCategory || 'Category'}</p>
                      <p className="text-xs font-medium text-emerald-600 truncate" title={feature.zoning || ''}>{feature.zoning || 'Description'}</p>
                    </div>
                  </div>

                  {propertyRisk && (
                    <PropertyRiskPanel risk={propertyRisk} />
                  )}

                  {/* Analytical Tools Section */}
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-surface-900 mb-3 px-1">Context Analysis</h4>
                    
                    {/* Raw Attributes Expander */}
                    <details className="mb-3 group">
                      <summary className="bg-surface-50 p-2.5 rounded-lg border border-surface-200 flex items-center justify-between cursor-pointer list-none hover:bg-surface-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <FileStack className="h-3.5 w-3.5 text-surface-400" />
                          <span className="text-xs font-semibold text-surface-700 uppercase tracking-tight">Full Source Attributes</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-surface-400 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="mt-2 p-3 bg-white border border-surface-200 rounded-lg max-h-60 overflow-y-auto space-y-2">
                        {Object.entries(feature.properties || {}).map(([key, value]) => (
                          <div key={key} className="flex flex-col border-b border-surface-50 pb-1.5 last:border-0 last:pb-0">
                            <span className="text-[10px] uppercase font-bold text-surface-400 tracking-tight leading-none mb-1">{key}</span>
                            <span className="text-[11px] font-mono text-surface-900 break-all">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </details>

                    <div className="bg-surface-50 p-3.5 rounded-lg border border-surface-200 flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-surface-900 mb-0.5">Site Context Buffer</h5>
                        <p className="text-xs text-surface-500 leading-relaxed mb-3">Dynamically generate a 50m radius around this parcel to identify adjacent uses and environmental overlaps.</p>
                        <Button 
                          variant={showBuffer ? "secondary" : "primary"} 
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

            {activeTab === 'market' && (
              <div className="space-y-4 animate-in fade-in">
                  {/* Property Price */}
                  <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5 mb-1">
                        <CircleDollarSign className="h-3 w-3" /> Property Details
                      </span>
                      {feature.saleStatus === 'For Sale' && feature.askingPrice ? (
                        <p className="text-sm font-medium text-surface-900">Asking Price: R {feature.askingPrice.toLocaleString()}</p>
                      ) : feature.lastSalePrice ? (
                         <p className="text-sm font-medium text-surface-900">Last Sale Price: R {feature.lastSalePrice.toLocaleString()} <span className="text-surface-400 font-normal text-[10px]">({feature.lastSaleDate ? new Date(feature.lastSaleDate).getFullYear() : 'Unknown'})</span></p>
                      ) : (
                        <p className="text-sm font-medium text-surface-500">Price: Not available</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-surface-200">
                      <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider mb-1 block">Land Value</span>
                      <p className="text-sm font-medium text-surface-900">
                        {feature.landValue ? `R ${feature.landValue.toLocaleString()}` : feature.lastValuation ? `R ${feature.lastValuation.toLocaleString()}` : 'Not available'}
                      </p>
                      {(feature.valuationYear || feature.valuationSource) && (
                         <p className="text-[10px] text-surface-500 mt-0.5">{feature.valuationSource || 'Municipal'} • {feature.valuationYear}</p>
                      )}
                    </div>
                  </div>

                  <EstimatedValuePanel valuation={valuationResult} />

                  {rentalEstimate && (
                    <RentalEstimatePanel estimate={rentalEstimate} />
                  )}

                  {marketSegment && (
                    <MarketSegmentsPanel segmentation={marketSegment} />
                  )}

                  {priceForecast && (
                    <div className="space-y-4">
                      <ForecastPanel forecast={priceForecast} />
                      <div className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider block mb-2">Value Trajectory (High-Confidence Model)</span>
                        <PriceForecastChart 
                          currentValue={valuationResult.estimatedValue || 0} 
                          growthRate={priceForecast.growthRate} 
                        />
                        <p className="text-[9px] text-surface-400 mt-2 leading-tight">
                          Projection incorporates yield momentum ({Math.round((priceForecast.growthRate || 0) * 1000) / 10}% CAGR) and hyper-local transaction density.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* History Tabs */}
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-surface-900 mb-3 px-1">Temporal Sequence</h4>
                    <div className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                       <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider block mb-3">Valuation Trend</span>
                       <ValuationTrendChart data={getValuationTrends(feature.valuationHistory || [])} className="mb-6" />
                       
                       <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider block mb-3">Transaction History</span>
                       <TransactionTimeline transactions={getTransactionHistory(feature.transactionHistory || [])} />
                       {anomalyResult && (
                         <div className="mt-3 border-t border-surface-200 pt-1">
                           <TransactionAnomalyPanel anomaly={anomalyResult} />
                         </div>
                       )}
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
                    onLinkToMap={() => setActiveTab('overview')}
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
                            onView={(a) => {
                              window.dispatchEvent(new CustomEvent('map:center-on-feature', { 
                                detail: { 
                                  geometry: a.geometry,
                                  parcelId: a.targetType === 'parcel' ? a.targetId : null
                                } 
                              }));
                            }}
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
                  variant={isComparing(feature.id) ? "secondary" : "primary"}
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
              targetType="parcel"
              targetId={String(feature.id)}
              initialTitle={editingNote?.title}
              initialBody={editingNote?.body}
              initialImageUrl={editingNote?.imageUrl}
              projectId={editingNote?.projectId}
              sourceRefs={editingNote?.sourceRefs}
              initialGeometry={editingNote?.geometry || feature.geometry}
              initialStyle={editingNote?.style}
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
