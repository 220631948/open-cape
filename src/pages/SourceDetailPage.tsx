import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ExternalLink, ShieldCheck, Database, Calendar, Map } from 'lucide-react';
import { useSourceCatalog } from '@/src/hooks/useSourceCatalog';
import { Button } from '@/src/components/ui/Button';
import { DataStatusBanner } from '@/src/components/ui/DataStatusBanner';
import { SourceBadge } from '@/src/components/ui/SourceBadge';
import { DataFreshnessPill } from '@/src/components/ui/DataFreshnessPill';

export const SourceDetailPage = () => {
   const { sourceId } = useParams<{ sourceId: string }>();
   const navigate = useNavigate();
   const { getSourceById, isLoading } = useSourceCatalog();

   const source = sourceId ? getSourceById(sourceId) : null;

   if (isLoading) return <div className="p-12 text-center text-surface-500">Loading source metadata...</div>;

   if (!source) {
      return (
         <div className="bg-surface-50 min-h-screen pt-20 pb-12 flex items-center justify-center">
            <div className="text-center space-y-4">
               <h2 className="text-2xl font-semibold text-surface-900">Source not found</h2>
               <Button variant="secondary" onClick={() => navigate('/sources')}>Return to Catalog</Button>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-surface-50 min-h-full">
         <div className="bg-white border-b border-surface-200 py-8 px-6">
            <div className="max-w-4xl mx-auto">
               <Button variant="ghost" size="sm" onClick={() => navigate('/sources')} className="mb-6 -ml-3 text-surface-500">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Catalog
               </Button>
               
               <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="space-y-3 flex-1">
                     <SourceBadge source={source} className="mb-2" />
                     <h1 className="text-3xl font-semibold text-surface-900 tracking-tight">{source.name}</h1>
                     <p className="text-surface-500 text-lg">{source.purposeDesc}</p>
                     
                     <div className="pt-2 flex items-center gap-3">
                        <DataFreshnessPill isLive={source.verificationStatus === 'verified-integration'} status={source.verificationStatus} />
                        <a href={source.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-rose-600 font-medium hover:underline flex items-center gap-1.5">
                           Official Documentation <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
            {source.verificationStatus === 'verified-integration' ? (
              <DataStatusBanner 
                variant="success" 
                title="System Status" 
                description="Verified sources are live. Application is performing normally." 
              />
            ) : (
              <DataStatusBanner variant="warning" />
            )}
            
            <section className="bg-white p-8 rounded-xl border border-surface-200">
               <h2 className="text-lg font-semibold text-surface-900 mb-6">Source Metadata Overview</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1">
                     <div className="text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> Category</div>
                     <div className="font-medium text-surface-900 capitalize">{source.category}</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1.5"><Map className="h-3.5 w-3.5" /> Coverage</div>
                     <div className="font-medium text-surface-900">{source.coverage}</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Quality Assurance</div>
                     <div className="font-medium text-surface-900">{source.qualityBadge}</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Licensing</div>
                     <div className="font-medium text-surface-900 leading-tight">{source.licenseNote}</div>
                  </div>
                  <div className="space-y-1">
                     <div className="text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Verification Status</div>
                     <div className="font-medium text-surface-900">
                        {source.verificationStatus === 'verified-integration' ? 'Live System Integration' : 
                         source.verificationStatus === 'pending-integration' ? 'Pending System Integration' : 'Metadata Only'}
                     </div>
                  </div>
               </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
                  <h3 className="font-semibold text-emerald-900">What this source will power</h3>
                  <ul className="text-sm text-emerald-800 space-y-2 list-disc list-inside leading-relaxed">
                     {source.category === 'zoning' && <li>Determine zoning restrictions (e.g. SR1, GR2)</li>}
                     {source.category === 'cadastre' && <li>Verify exact property bounding coordinates</li>}
                     {source.category === 'cadastre' && <li>Link Allotment Areas to ERF Numbers</li>}
                     {source.category === 'registry' && <li>Identify historical ownership trails</li>}
                     {source.category === 'market' && <li>Baseline property valuations for the area</li>}
                     {source.category === 'contextual' && <li>Overlay topographic maps and roads</li>}
                     <li>Provide verifiable IDs for workspace references</li>
                  </ul>
               </section>

               <section className="p-6 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                  <h3 className="font-semibold text-amber-900">What it does NOT provide</h3>
                  <ul className="text-sm text-amber-800 space-y-2 list-disc list-inside leading-relaxed">
                     <li>Currently ingests 0 live records.</li>
                     <li>We do not estimate boundaries that are missing here.</li>
                     <li>We do not clean dirty official title deeds dynamically.</li>
                     <li>All analytical outputs require final legal cross-checking.</li>
                  </ul>
               </section>
            </div>
         </div>
      </div>
   );
};
