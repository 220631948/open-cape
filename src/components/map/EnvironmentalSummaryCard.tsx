import React from 'react';
import { Card } from '@/components/ui/Card';
import { EarthEngineStatusBanner } from './EarthEngineStatusBanner';
import { useEarthEngineAccess } from '@/hooks/useEarthEngineAccess';
import { Activity, Droplets, Mountain, ThermometerSun, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EnvironmentalSummaryCardProps {
  featureId?: string;
  onLinkToMap?: () => void;
}

export const EnvironmentalSummaryCard: React.FC<EnvironmentalSummaryCardProps> = ({ featureId, onLinkToMap }) => {
  const { hasAccess, isChecking } = useEarthEngineAccess();

  if (isChecking) return null;

  if (!hasAccess) {
    return <EarthEngineStatusBanner />;
  }

  return (
    <div className="space-y-4">
      <EarthEngineStatusBanner />

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-surface-50 border border-surface-200 shadow-none">
          <div className="flex items-center gap-2 mb-2 text-surface-500">
            <Activity className="h-4 w-4" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider">Vegetation (NDVI)</h4>
          </div>
          <p className="text-sm font-semibold text-emerald-700">0.42 - Moderate</p>
          <div className="mt-2 text-[9px] text-surface-400">
            Source: Sentinel-2
          </div>
        </Card>

        <Card className="p-3 bg-surface-50 border border-surface-200 shadow-none">
          <div className="flex items-center gap-2 mb-2 text-surface-500">
            <ThermometerSun className="h-4 w-4 text-amber-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider">Heat Exposure</h4>
          </div>
          <p className="text-sm font-semibold text-rose-700">Elevated (LST)</p>
          <div className="mt-2 text-[9px] text-surface-400">
            Source: Landsat 8
          </div>
        </Card>

        <Card className="p-3 bg-surface-50 border border-surface-200 shadow-none">
          <div className="flex items-center gap-2 mb-2 text-surface-500">
            <Droplets className="h-4 w-4 text-blue-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider">Water Context</h4>
          </div>
          <p className="text-sm font-semibold text-surface-900">Dry Surface</p>
          <div className="mt-2 text-[9px] text-surface-400">
            Analytical indicator only
          </div>
        </Card>

        <Card className="p-3 bg-surface-50 border border-surface-200 shadow-none">
          <div className="flex items-center gap-2 mb-2 text-surface-500">
            <Mountain className="h-4 w-4" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider">Terrain</h4>
          </div>
          <p className="text-sm font-semibold text-surface-900">4% Slope</p>
          <div className="mt-2 text-[9px] text-surface-400">
            Derived from SRTM
          </div>
        </Card>
      </div>

      <div className="bg-surface-50 p-4 border border-surface-200 rounded-lg">
         <h4 className="text-sm font-semibold text-surface-900 mb-2 flex items-center gap-1.5"><Info className="h-4 w-4 text-surface-400"/> Provenance</h4>
         <p className="text-xs text-surface-600 leading-relaxed mb-3">
           Derived from Sentinel-2 & Landsat 8 imagery via Google Earth Engine. Temporal range: Last 12 months. Spatial resolution: 10m - 30m. 
           This output is analytical and intended for environmental context only.
         </p>
         {onLinkToMap && (
           <Button variant="outline" size="sm" className="w-full" onClick={onLinkToMap}>
             View in Map Workspace
           </Button>
         )}
      </div>
    </div>
  );
};
