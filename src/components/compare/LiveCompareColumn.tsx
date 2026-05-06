import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getLiveErfRecordById } from '@/source_connectors/cctOpenDataClient';
import { ProvenanceCard, Skeleton } from '@/components/ui';

const ComparisonCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className="bg-white border border-surface-200 rounded-lg p-4 shadow-sm h-[200px] overflow-y-auto flex flex-col gap-3">
     {children}
  </div>
);

const DataRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-surface-500 uppercase tracking-tight">{label}</span>
    <span className="text-sm text-surface-900 leading-snug">{value}</span>
  </div>
);

export const LiveCompareColumn = ({ item, getIcon, getProjectName, onRemove }: any) => {
   const [liveData, setLiveData] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
     if (item.type === 'parcel') {
       let objId = item.id;
       if (objId.startsWith('cct-')) objId = objId.substring(4);
       
       setIsLoading(true);
       getLiveErfRecordById(objId).then(data => {
         setLiveData(data);
         setIsLoading(false);
       }).catch(() => setIsLoading(false));
     }
   }, [item]);

   const valueOrDefault = (val: any) => val || <span className="italic text-surface-400">Not available from source</span>;

   return (
      <div className="w-[300px] sm:w-[350px] shrink-0 flex flex-col gap-6">
         {/* Column Header */}
         <div className={`bg-white border text-center border-surface-200 rounded-lg p-4 shadow-sm relative group h-[72px] flex flex-col items-center justify-center ${liveData ? 'border-emerald-200 bg-emerald-50/10' : ''}`}>
            <button 
              onClick={() => onRemove(item.id)}
              className="absolute -top-2 -right-2 bg-white border border-surface-200 rounded-full p-1 text-surface-400 hover:text-rose-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 mb-1">
              {getIcon(item.type)}
              <span className={`text-xs font-semibold uppercase tracking-wider ${liveData ? 'text-emerald-700' : 'text-surface-500'}`}>
                 {liveData ? 'LIVE PARCEL' : item.type.replace('-', ' ')}
              </span>
            </div>
            <h3 className="font-semibold text-surface-900 truncate w-full text-center" title={item.title}>{item.title}</h3>
         </div>

         {/* Summary */}
         <ComparisonCard>
            {isLoading ? <Skeleton className="h-20 w-full" /> : (
              <>
               <DataRow label="Identifier" value={liveData ? liveData.id : "Not available from source"} />
               <DataRow label="Location Context" value={liveData ? (liveData.address || liveData.allotmentArea) : "Not available from source"} />
               <DataRow label="Project" value={getProjectName(item.projectId)} />
              </>
            )}
         </ComparisonCard>

         {/* Planning */}
         <ComparisonCard>
            {isLoading ? <Skeleton className="h-20 w-full" /> : (
              <>
               {liveData ? (
                 <>
                  <DataRow label="Base Zone" value={valueOrDefault(liveData.zoning)} />
                  <DataRow label="Zoning Category" value={valueOrDefault(liveData.zoningCategory)} />
                  <DataRow label="Permitted Uses" value={valueOrDefault(null)} />
                 </>
               ) : (
                 <>
                  <DataRow label="Zoning Rules" value="Zoning and planning rules are not yet connected to a verified source." />
                  <DataRow label="Zoning Category" value="Not available from source" />
                  <DataRow label="Permitted Uses" value="Not available from source" />
                 </>
               )}
              </>
            )}
         </ComparisonCard>

         {/* Market */}
         <ComparisonCard>
            <DataRow label="Market Status" value="No market data connected yet." />
         </ComparisonCard>

         {/* Context */}
         <ComparisonCard>
            <DataRow label="Area Context" value="Context data not loaded." />
         </ComparisonCard>

         {/* Notes */}
         <ComparisonCard>
            <DataRow label="Notes" value={item.type === 'bookmark' && item.notes ? item.notes : "No user notes available."} />
         </ComparisonCard>

         {/* Provenance */}
         <ComparisonCard>
            {isLoading ? <Skeleton className="h-20 w-full" /> : liveData ? (
              <ProvenanceCard 
                 source={{
                   id: `cct_odp_${liveData.id}`,
                   sourceId: `cct_odp_${liveData.id}`,
                   name: "City of Cape Town ODP",
                   websiteUrl: "https://odp.capetown.gov.za/",
                   category: 'cadastre',
                   coverage: 'City of Cape Town',
                   isPublic: true,
                   purposeDesc: 'Used for live rendering.',
                   licenseNote: "Public Domain",
                   qualityBadge: "Verified"
                 }}
              />
            ) : (
              <ProvenanceCard 
                 source={{
                   id: "placeholder",
                   sourceId: "placeholder",
                   name: "No live source connected yet.",
                   websiteUrl: "#",
                   category: 'registry',
                   coverage: 'None',
                   isPublic: false,
                   purposeDesc: 'N/A',
                   licenseNote: "No License",
                   qualityBadge: "unknown"
                 }}
              />
            )}
         </ComparisonCard>
      </div>
   );
};
