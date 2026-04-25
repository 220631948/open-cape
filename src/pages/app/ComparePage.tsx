import React from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Trash2, Map, LayoutDashboard, Component, Bookmark, Info, Building2, MapPin, Tag, MessageSquare, Plus } from 'lucide-react';
import { useCompareState, CompareItemType } from '@/src/contexts/CompareContext';
import { Button } from '@/src/components/ui/Button';
import { DataStatusBanner } from '@/src/components/ui/DataStatusBanner';
import { ProvenanceCard } from '@/src/components/ui/ProvenanceCard';
import { cn } from '@/src/lib/utils';
import { useProjects } from '@/src/hooks/useProjects';
import { LiveCompareColumn } from '@/src/components/compare/LiveCompareColumn';

export const ComparePage = () => {
  const navigate = useNavigate();
  const { compareItems, removeFromCompare, clearCompare } = useCompareState();
  const { projects } = useProjects();

  const getIcon = (type: CompareItemType) => {
    switch (type) {
      case 'parcel': return <Component className="w-5 h-5 text-indigo-500" />;
      case 'area': return <Map className="w-5 h-5 text-emerald-500" />;
      case 'saved-map': return <LayoutDashboard className="w-5 h-5 text-blue-500" />;
      case 'bookmark': return <Bookmark className="w-5 h-5 text-amber-500" />;
    }
  };

  const hasBookmarks = compareItems.some(item => item.type === 'bookmark');

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Not associated';
    return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  return (
    <div className="flex flex-col h-full bg-surface-50 overflow-hidden">
      <header className="bg-white border-b border-surface-200 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-surface-500">
                 <ArrowLeft className="w-4 h-4 mr-2" /> Back
               </Button>
               <div>
                  <h1 className="text-xl font-bold text-surface-900 tracking-tight">Compare Targets</h1>
                  <p className="text-xs text-surface-500">Comparing {compareItems.length} of 4 items</p>
               </div>
            </div>
            {compareItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompare} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                <Trash2 className="w-4 h-4 mr-2" /> Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-fit max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
           {/* Global messaging */}
           <div className="space-y-4">
             <DataStatusBanner 
               status="Dataset status: Live CCT data allows active comparision. Earth Engine data remains analytical."
             />
             
             {hasBookmarks && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                   <h3 className="text-sm font-semibold text-amber-800 mb-1">Dataset Status: Bookmark specific</h3>
                   <p className="text-sm text-amber-700"> Many bookmarks may show "No live source" as integration with the verified cadastral database is still pending for this environment slice. Bookmarks currently save coordinates and manual notes.</p>
                </div>
             )}
           </div>

           {compareItems.length === 0 ? (
             <div className="border-2 border-dashed border-surface-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-surface-50 min-h-[400px]">
               <LayoutDashboard className="w-16 h-16 text-surface-300 mb-6" />
               <h2 className="text-xl font-semibold text-surface-900 mb-2">Nothing to compare yet</h2>
               <p className="text-surface-500 max-w-md">
                  Add items to compare from the map, parcel details, area details, or bookmarks. You can compare up to 4 items side-by-side.
               </p>
               <Button onClick={() => navigate('/app/map')} className="mt-6">
                 Explore Map
               </Button>
             </div>
           ) : (
              <div className="flex gap-6 pb-8">
                 {/* Left labels column */}
                 <div className="w-48 shrink-0 flex flex-col gap-6 pt-[72px]">
                    <SectionLabel icon={<Info />} label="Summary" />
                    <SectionLabel icon={<Building2 />} label="Planning & Zoning" />
                    <SectionLabel icon={<Tag />} label="Market & Activity" />
                    <SectionLabel icon={<MapPin />} label="Context & Accessibility" />
                    <SectionLabel icon={<MessageSquare />} label="User Notes" />
                    <SectionLabel icon={<ShieldCheck />} label="Provenance" />
                 </div>

                 {/* Comparison Columns */}
                 {compareItems.map(item => (
                    <LiveCompareColumn 
                       key={item.id}
                       item={item}
                       getIcon={getIcon}
                       getProjectName={getProjectName}
                       onRemove={removeFromCompare}
                    />
                 ))}
                 
                 {/* Add more column */}
                 {compareItems.length < 4 && (
                    <div className="w-[300px] shrink-0 border-2 border-dashed border-surface-200 rounded-lg flex flex-col items-center justify-center p-6 text-center text-surface-500 hover:text-surface-700 hover:border-surface-300 hover:bg-surface-100 transition-colors cursor-pointer" onClick={() => navigate('/app/map')}>
                       <Plus className="w-8 h-8 mb-2 text-surface-400" />
                       <span className="font-medium text-sm">Add Item</span>
                    </div>
                 )}
              </div>
           )}
        </div>
      </main>
    </div>
  );
};

const SectionLabel = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-2 text-surface-900 font-semibold h-[200px] opacity-80 pt-4 px-2 select-none border-b border-transparent">
     {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-surface-400' })}
     {label}
  </div>
);

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

import { X, ShieldCheck } from 'lucide-react';
