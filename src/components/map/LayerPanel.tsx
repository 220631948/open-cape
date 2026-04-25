import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Map as MapIcon,
  Database,
  Eye,
  EyeOff,
  LayoutTemplate,
  MapPin,
  FolderOpen,
  FileStack,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { Card } from "@/src/components/ui/Card";
import { DataStatusBanner } from "@/src/components/ui/DataStatusBanner";
import { EnvironmentalIntelligencePanel } from "./EnvironmentalIntelligencePanel";
import { EnvironmentalLegend } from "./EnvironmentalLegend";

interface LayerPanelProps {
  className?: string;
  activeLayers: string[];
  onToggleLayer: (layerId: string) => void;
  baseMap?: "street" | "satellite";
  setBaseMap?: (v: "street" | "satellite") => void;
  layerOpacities?: Record<string, number>;
  onOpacityChange?: (layerId: string, opacity: number) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  className,
  activeLayers,
  onToggleLayer,
  baseMap = "street",
  setBaseMap = (v: "street" | "satellite") => {},
  layerOpacities = {},
  onOpacityChange = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [layerStatus, setLayerStatus] = useState<Record<string, { loading: boolean; error: string | null; loaded?: number; total?: number | null }>>({});

  useEffect(() => {
    const handleStatus = (e: any) => {
       const { id, loading, error, loaded, total } = e.detail;
       setLayerStatus(prev => ({
         ...prev,
         [id]: { loading, error, loaded, total }
       }));
    };
    window.addEventListener('vector-layer-status', handleStatus);
    return () => window.removeEventListener('vector-layer-status', handleStatus);
  }, []);

  const renderLayerGroup = (
    groupName: string,
    icon: React.ReactNode,
    helperText: string,
    layers: Array<{ id: string; name: string; color: string }>,
  ) => (
    <section>
      <h3
        className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-1 flex items-center gap-2"
        title={helperText}
      >
        {icon}
        {groupName}
      </h3>
      <p className="text-[10px] text-surface-400 mb-2 leading-tight px-1">
        {helperText}
      </p>
      <div className="space-y-0.5">
        {layers.map((layer) => {
          const isActive = activeLayers.includes(layer.id);
          return (
            <div
              key={layer.id}
              className={cn(
                "flex items-center gap-3 p-1.5 rounded-md transition-colors",
                isActive
                  ? "bg-surface-50 text-surface-900"
                  : "hover:bg-surface-50 text-surface-600",
              )}
            >
              <button
                onClick={() => onToggleLayer(layer.id)}
                title={isActive ? "Hide layer" : "Show layer"}
                className={cn(
                  "shrink-0 p-1 rounded-sm transition-colors",
                  isActive
                    ? layer.color
                    : "text-surface-300 hover:text-surface-500",
                )}
              >
                {isActive ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              <div
                className="flex-1 text-xs font-medium truncate flex items-center gap-2"
                title={layer.name}
              >
                {layer.name}
                {isActive && layerStatus[layer.id]?.loaded !== undefined && (
                   <span className="text-[10px] text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded-full ml-1">
                     {layerStatus[layer.id].loaded}{layerStatus[layer.id].total ? ` / ${layerStatus[layer.id].total}` : ''}
                   </span>
                )}
                {isActive && layerStatus[layer.id]?.loading && (
                  <Loader2 className="h-3 w-3 animate-spin text-surface-400" />
                )}
                {isActive && layerStatus[layer.id]?.error && (
                  <span className="text-[10px] text-rose-500" title={layerStatus[layer.id]?.error || "Error"}>⚠️</span>
                )}
              </div>
              {/* Opacity slider */}
              {isActive && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layerOpacities[layer.id] ?? 1}
                  onChange={(e) => onOpacityChange(layer.id, parseFloat(e.target.value))}
                  className="w-12 h-1 bg-surface-200 rounded-full appearance-none cursor-pointer accent-surface-500 opacity-50 hover:opacity-100 transition-opacity"
                  title="Adjust opacity"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  if (!isOpen) {
    return (
      <div
        className={cn(
          "bg-white border-r border-surface-200 shadow-sm flex flex-col p-2",
          className,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          title="Expand layers"
          className="text-surface-500 hover:text-surface-900"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-72 bg-white border-r border-surface-200 shadow-sm flex flex-col h-full z-10 transition-all",
        className,
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200 shrink-0">
        <div className="flex items-center gap-2 font-semibold text-surface-900">
          <Layers className="h-4 w-4 text-surface-500" />
          <span>Workspace Layers</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="-mr-2 text-surface-400 hover:text-surface-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basemap Section */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-1 flex items-center gap-2">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Basemap
          </h3>
          <p className="text-[10px] text-surface-400 mb-2 leading-tight px-1">
            Base contextual map style.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setBaseMap('street')}
              className={cn("border-2 rounded-md overflow-hidden relative group", baseMap === 'street' ? "border-rose-500" : "border-transparent hover:border-surface-300")}
            >
              <div className="aspect-video bg-surface-100 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                <MapIcon className="h-4 w-4 text-surface-400" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-white/90 text-[10px] font-medium py-1 px-2 border-t border-surface-200">
                Street Map
              </div>
            </button>
            <button
              onClick={() => setBaseMap('satellite')}
              className={cn("border-2 rounded-md overflow-hidden relative group transition-colors", baseMap === 'satellite' ? "border-rose-500" : "border-transparent hover:border-surface-300 opacity-80 hover:opacity-100")}
              title="Satellite imagery (context layer)"
            >
              <div className="aspect-video bg-surface-900 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                <Eye className="h-4 w-4 text-surface-400 relative z-10" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-surface-900/90 text-white text-[10px] font-medium py-1 px-2 border-t border-surface-700">
                Satellite (ESRI)
              </div>
            </button>
          </div>
        </section>

        {renderLayerGroup(
          "Supplemental Imagery",
          <Eye className="h-3.5 w-3.5" />,
          "Alternative imagery sources (contextual, not for legal property boundary confirmation).",
          [
            {
              id: "nasa-gibs",
              name: "NASA GIBS Satellite (Low-Res)",
              color: "text-blue-500",
            },
            {
              id: "openaerialmap",
              name: "Local Aerial (OAM Community)",
              color: "text-emerald-500",
            },
          ],
        )}

        {renderLayerGroup(
          "Cadastre Layers",
          <MapPin className="h-3.5 w-3.5" />,
          "Primary property boundary datasets.",
          [
            {
              id: "erf_boundaries",
              name: "Cadastral (ERF) Boundaries",
              color: "text-rose-500",
            },
            {
              id: "general_plans",
              name: "General Plans",
              color: "text-rose-500",
            },
          ],
        )}

        {renderLayerGroup(
          "Planning Layers",
          <FileStack className="h-3.5 w-3.5" />,
          "Zoning and strategic development zones.",
          [
            {
              id: "zoning_dms",
              name: "Zoning (DMS base)",
              color: "text-blue-500",
            },
            {
              id: "zoning_overlay",
              name: "Zoning Overlays",
              color: "text-blue-500",
            },
            {
              id: "sdf",
              name: "Spatial Development Framework",
              color: "text-amber-500",
            },
          ],
        )}

        {renderLayerGroup(
          "Context Layers",
          <MapIcon className="h-3.5 w-3.5" />,
          "Environmental and contextual overlays.",
          [
            {
              id: "contours",
              name: "Topographic Contours",
              color: "text-emerald-500",
            },
            {
              id: "flood_zones",
              name: "Flood Risk Zones",
              color: "text-emerald-500",
            },
          ],
        )}

        {renderLayerGroup(
          "Facilities & Transport",
          <MapPin className="h-3.5 w-3.5" />,
          "Schools, hospitals, clinics, and transit.",
          [
            {
              id: "schools",
              name: "Schools",
              color: "text-blue-500",
            },
            {
              id: "health_care",
              name: "Health Care",
              color: "text-red-500",
            },
            {
              id: "train_stations",
              name: "Train Stations",
              color: "text-orange-500",
            },
            {
              id: "libraries",
              name: "Libraries",
              color: "text-violet-500",
            }
          ],
        )}

        {renderLayerGroup(
          "Saved Overlays",
          <FolderOpen className="h-3.5 w-3.5" />,
          "Your saved annotations and drawings.",
          [
            {
              id: "user_drawings",
              name: "My Drawings",
              color: "text-purple-500",
            },
          ],
        )}

        <div className="border-t border-surface-200 mt-2 -mx-4 pt-2">
          <EnvironmentalIntelligencePanel />
        </div>

        {/* Global Connection Health Warning */}
        <div className="mt-4 px-2">
          <DataStatusBanner variant="warning" globalAlert={true} />
        </div>
      </div>

      {/* Legend Area */}
      <EnvironmentalLegend />
      
      {/* Placeholder for standard legends if EE is not active */}
      <div className="h-20 border-t border-surface-200 bg-surface-50 p-4 shrink-0 flex flex-col justify-center items-center text-center">
        <Layers className="h-4 w-4 text-surface-300 mb-1" />
        <p className="text-[10px] text-surface-500 text-balance font-medium">
          Standard layer legends will appear here.
        </p>
      </div>
    </div>
  );
};
