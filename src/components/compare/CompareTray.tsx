import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layers, X, Component, Map, LayoutDashboard, Bookmark, ArrowRight, Activity } from 'lucide-react';
import { useCompareState, CompareItemType } from '@/src/contexts/CompareContext';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

export const CompareTray = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompareState();
  const navigate = useNavigate();
  const location = useLocation();

  if (compareItems.length === 0) return null;
  if (location.pathname.startsWith('/app/compare')) return null;

  const getIcon = (type: CompareItemType) => {
    switch (type) {
      case 'parcel': return <Component className="w-4 h-4 text-indigo-500" />;
      case 'area': return <Map className="w-4 h-4 text-emerald-500" />;
      case 'saved-map': return <LayoutDashboard className="w-4 h-4 text-blue-500" />;
      case 'bookmark': return <Bookmark className="w-4 h-4 text-amber-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-6 left-[280px] right-6 z-50 pointer-events-none flex justify-center px-4 sm:px-0">
       <div className="bg-surface-900 border border-surface-800 shadow-2xl rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-4 md:gap-6 pointer-events-auto max-w-full w-full md:w-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 shrink-0 px-2 md:px-0 w-full md:w-auto justify-between md:justify-start">
             <div className="flex items-center gap-2 text-white font-medium">
               <Layers className="w-5 h-5 text-surface-400" />
               <span className="hidden md:inline">Compare</span>
               <span className="text-surface-400 text-xs md:text-sm bg-surface-800 px-2 py-0.5 rounded-full">{compareItems.length}/4</span>
             </div>
             <button onClick={clearCompare} className="text-surface-400 hover:text-white transition-colors p-1 md:hidden">
                <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar pl-1">
            {compareItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-surface-800 rounded-lg pr-2 pl-3 py-1.5 shrink-0 max-w-[160px] md:max-w-[200px] border border-surface-700/50">
                 <div className="shrink-0">{getIcon(item.type)}</div>
                 <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate w-full" title={item.title}>{item.title}</span>
                 </div>
                 <button onClick={() => removeFromCompare(item.id)} className="shrink-0 ml-auto p-1 text-surface-400 hover:text-rose-400 rounded-md hover:bg-surface-700 transition-colors">
                    <X className="w-3.5 h-3.5" />
                 </button>
              </div>
            ))}
            {compareItems.length < 4 && (
              <div className="flex items-center justify-center shrink-0 w-10 h-10 border border-dashed border-surface-700 rounded-lg text-surface-500 text-xs font-medium">
                 {compareItems.length + 1}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between px-2 md:px-0">
            <button onClick={clearCompare} className="text-surface-400 hover:text-white transition-colors text-xs font-medium hidden md:block">
               Clear
            </button>
            <Button 
               onClick={() => navigate('/app/compare')} 
               className="bg-primary-600 hover:bg-primary-500 text-white border-0 shadow-lg w-full md:w-auto h-10"
            >
               Compare Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
       </div>
    </div>
  );
};
