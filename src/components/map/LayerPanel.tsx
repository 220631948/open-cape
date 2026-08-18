import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Map as MapIcon,
  Eye,
  EyeOff,
  LayoutTemplate,
  MapPin,
  FolderOpen,
  FileStack,
  Loader2,
  WifiOff,
  Filter,
  Globe,
  Plus,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AddLayerDialog } from "./AddLayerDialog";
import { MunicipalitySelector } from "./MunicipalitySelector";
import { getLayerCapabilities } from "@/registry/layerCapabilityRegistry";
import { useProfile } from "@/contexts/useProfile";
import { useTenantData } from "@/hooks/useTenantData";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableActiveLayerItem = ({ id, name, layerInfo, onToggle, layerStatus, layerOpacities, onOpacityChange }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const caps = getLayerCapabilities(id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-1.5 rounded-md transition-colors bg-surface-50 text-surface-900",
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-surface-200 p-1 rounded">
        <GripVertical className="h-3.5 w-3.5 text-surface-400" />
      </div>
      <button
        onClick={() => onToggle(id)}
        title="Hide layer"
        className={cn("shrink-0 p-1 rounded-sm transition-colors", layerInfo?.color || "text-surface-700")}
      >
        <Eye className="h-4 w-4" />
      </button>
      <div className="flex-1 text-xs font-medium truncate flex flex-col items-start" title={name}>
        <div className="flex items-center gap-2">
          {name}
          {layerStatus[id]?.loaded !== undefined && (
              <span className="text-[10px] text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded-full ml-1">
                {layerStatus[id].loaded}{layerStatus[id].total ? ` / ${layerStatus[id].total}` : ''}
              </span>
          )}
          {layerStatus[id]?.loading && (
            <Loader2 className="h-3 w-3 animate-spin text-surface-400" />
          )}
          {layerStatus[id]?.error && (
            <span className="text-[10px] text-rose-500" title={layerStatus[id]?.error || "Error"}>⚠️</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={layerOpacities[id] ?? 1}
        onChange={(e) => onOpacityChange(id, parseFloat(e.target.value))}
        className="w-12 h-1 bg-surface-200 rounded-full appearance-none cursor-pointer accent-surface-500 opacity-50 hover:opacity-100 transition-opacity"
        title="Adjust opacity"
      />
    </div>
  );
};

interface LayerPanelProps {
  className?: string;
  activeLayers: string[];
  onToggleLayer: (layerId: string) => void;
  onReorderActiveLayers?: (layers: string[]) => void;
  baseMap?: "street" | "satellite" | "topo";
  setBaseMap?: (v: "street" | "satellite" | "topo") => void;
  showHillshade?: boolean;
  setShowHillshade?: (v: boolean) => void;
  historicalYear?: number | null;
  setHistoricalYear?: (v: number | null) => void;
  layerOpacities?: Record<string, number>;
  onOpacityChange?: (layerId: string, opacity: number) => void;
  showProjectPulse?: boolean;
  setShowProjectPulse?: (v: boolean) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  className,
  activeLayers,
  onToggleLayer,
  onReorderActiveLayers,
  baseMap = "street",
  setBaseMap = (v: "street" | "satellite" | "topo") => {},
  showHillshade = false,
  setShowHillshade = (v: boolean) => {},
  showProjectPulse = true,
  setShowProjectPulse = (v: boolean) => {},
  historicalYear = null,
  setHistoricalYear = (v: number | null) => {},
  layerOpacities = {},
  onOpacityChange = (layerId: string, opacity: number) => {}
}: LayerPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [layerStatus, setLayerStatus] = useState<Record<string, { loading: boolean; error: string | null; loaded?: number; total?: number | null }>>({});
  const [isAddLayerOpen, setIsAddLayerOpen] = useState(false);
  const { profile } = useProfile();
  const { importGeoJSON, isImporting } = useTenantData();

  // Handle adding custom layers from URLs
  const handleAddCustomSource = (source: any) => {
    // This will be handled by a global custom sources hook or MapPage state
    // For now, we'll dispatch a custom event that MapPage listens to
    window.dispatchEvent(new CustomEvent('map:add-custom-source', { detail: source }));
  };

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

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('layerPanelOpenGroups');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return {
      "Active Layers": true,
      "Cadastre Layers": true,
      "Western Cape": true
    };
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderActiveLayers) {
      const oldIndex = activeLayers.indexOf(active.id as string);
      const newIndex = activeLayers.indexOf(over.id as string);
      const newLayers = arrayMove(activeLayers, oldIndex, newIndex);
      onReorderActiveLayers(newLayers);
    }
  };

  const getLayerInfo = (id: string) => {
    const allLayers = [
      { id: "nasa-gibs", name: "NASA GIBS Satellite (Low-Res)", color: "text-blue-500" },
      { id: "openaerialmap", name: "Local Aerial (OAM Community)", color: "text-emerald-500" },
      { id: "erf_boundaries", name: "City of Cape Town (ERF)", color: "text-rose-500" },
      { id: "general_plans", name: "General Plans", color: "text-rose-500" },
      { id: "zoning_dms", name: "Zoning (DMS base)", color: "text-blue-500" },
      { id: "zoning_overlay", name: "Zoning Overlays", color: "text-blue-500" },
      { id: "sdf", name: "Spatial Development Framework", color: "text-amber-500" },
      { id: "contours", name: "Topographic Contours", color: "text-emerald-500" },
      { id: "flood_zones", name: "Flood Risk Zones", color: "text-emerald-500" },
      { id: "osm_geofabrik_sa", name: "OSM Base (South Africa)", color: "text-emerald-500" },
      { id: "wcgp-cadastre-vector", name: "Western Cape Cadastre", color: "text-rose-500" },
      { id: "wcgp-zoning", name: "Western Cape Zoning", color: "text-blue-500" },
      { id: "wcgp-topo", name: "Western Cape Topographic Map", color: "text-emerald-500" },
      { id: "wcgp-aerial", name: "Western Cape Aerial Imagery", color: "text-blue-500" },
      { id: "imported_geojson", name: "Imported GeoJSON", color: "text-indigo-500" },
      { id: "schools", name: "Schools", color: "text-blue-500" },
      { id: "health_care", name: "Health Care", color: "text-red-500" },
      { id: "train_stations", name: "Train Stations", color: "text-orange-500" },
      { id: "libraries", name: "Libraries", color: "text-violet-500" },
      { id: "user_drawings", name: "My Drawings", color: "text-purple-500" }
    ];
    return allLayers.find(l => l.id === id) || { id, name: id, color: "text-surface-700" };
  };

  useEffect(() => {
    localStorage.setItem('layerPanelOpenGroups', JSON.stringify(openGroups));
  }, [openGroups]);

  const renderLayerGroup = (
    groupName: string,
    icon: React.ReactNode,
    helperText: string,
    layers: Array<{ id: string; name: string; color: string }>,
  ) => {
    const isGroupOpen = openGroups[groupName] ?? false;
    
    const handleToggleGroup = (e: React.MouseEvent) => {
      e.preventDefault();
      setOpenGroups(prev => ({
        ...prev,
        [groupName]: !prev[groupName]
      }));
    };

    const filteredLayers = layers.filter(layer => 
      layer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (layer.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (searchTerm && filteredLayers.length === 0) return null;

    const layersToRender = searchTerm ? filteredLayers : layers;
    
    return (
      <details className={cn("group", searchTerm && "open")} open={searchTerm ? true : isGroupOpen}>
        <summary 
          onClick={handleToggleGroup}
          className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-1 flex items-center gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:text-surface-700 transition-colors" 
          title={helperText}
        >
          <div className="flex items-center gap-2 flex-1">
            {icon}
            {groupName} <span className="text-[10px] font-normal opacity-70">({layersToRender.length})</span>
          </div>
          <ChevronRight className={cn("h-4 w-4 transition-transform shrink-0 text-surface-400", (searchTerm ? true : isGroupOpen) && "rotate-90")} />
        </summary>
        {!searchTerm && (
          <p className="text-[10px] text-surface-400 mb-2 leading-tight px-1 ml-5">
            {helperText}
          </p>
        )}
        <div className="space-y-0.5 ml-1">
          {layersToRender.map((layer) => {
            const isActive = activeLayers.includes(layer.id);
            const caps = getLayerCapabilities(layer.id);
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
                  className="flex-1 text-xs font-medium truncate flex flex-col items-start"
                  title={layer.name}
                >
                  <div className="flex items-center gap-2">
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
                  {caps && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {caps.supportsOffline && <span title="Supports Offline Cache"><WifiOff className="h-2.5 w-2.5 text-surface-400" /></span>}
                      {caps.supportsFiltering && <span title="Supports Municipality Filtering"><Filter className="h-2.5 w-2.5 text-surface-400" /></span>}
                      {caps.geometryType && <span className="text-[9px] text-surface-400 px-1 border rounded">{caps.geometryType}</span>}
                    </div>
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
      </details>
    );
  };

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
          onClick={() => setIsAddLayerOpen(true)}
          className="text-surface-400 hover:text-indigo-600 transition-colors"
          title="Add custom layer"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="-mr-2 text-surface-400 hover:text-surface-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {isAddLayerOpen && (
        <AddLayerDialog 
          onClose={() => setIsAddLayerOpen(false)} 
          onAdd={handleAddCustomSource} 
        />
      )}

      <div className="px-4 py-2 border-b border-surface-100 flex items-center gap-2 bg-surface-50">
        <div className="relative flex-1 group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search layers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 bg-white border border-surface-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium placeholder:text-surface-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-surface-100 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-surface-400 hover:text-surface-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Active Layers Section (Drag to Reorder) */}
        {!searchTerm && activeLayers.length > 0 && (
          <section className="bg-surface-50 -mx-4 px-4 py-3 border-y border-surface-200">
             <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-1 flex items-center gap-2">
               <Layers className="h-3.5 w-3.5" />
               Active Layers
             </h3>
             <p className="text-[10px] text-surface-400 mb-2 leading-tight px-1">
               Drag layers to reorder them on the map. Top layers render above bottom layers.
             </p>
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={activeLayers} strategy={verticalListSortingStrategy}>
                 <div className="space-y-1">
                    <div className="flex items-center justify-between p-2 mb-1 bg-rose-50 border border-rose-100 rounded-lg">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-tight">Spatial Project Pulse</span>
                       </div>
                       <button
                         role="switch"
                         aria-checked={showProjectPulse}
                         aria-label="Toggle Spatial Project Pulse layer"
                         onClick={() => setShowProjectPulse(!showProjectPulse)}
                         className={cn("w-8 h-4 rounded-full flex items-center px-0.5 transition-colors", showProjectPulse ? "bg-rose-500" : "bg-surface-300")}
                       >
                         <div className={cn("w-3 h-3 rounded-full bg-white shadow-sm transition-transform", showProjectPulse ? "translate-x-4" : "translate-x-0")} />
                       </button>
                    </div>
                   {activeLayers.map((id) => {
                     const layerInfo = getLayerInfo(id);
                     return (
                       <SortableActiveLayerItem 
                         key={id}
                         id={id}
                         name={layerInfo.name}
                         layerInfo={layerInfo}
                         onToggle={onToggleLayer}
                         isActive={true}
                         layerStatus={layerStatus}
                         layerOpacities={layerOpacities}
                         onOpacityChange={onOpacityChange}
                       />
                     );
                   })}
                 </div>
               </SortableContext>
             </DndContext>
          </section>
        )}

        {/* Municipality Filter Section */}
        {!searchTerm && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-1 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              Municipality Filter
            </h3>
            <p className="text-[10px] text-surface-400 mb-2 leading-tight px-1">
              Isolate features by municipality boundary.
            </p>
            <MunicipalitySelector />
          </section>
        )}

        {/* Basemap Section */}
        {!searchTerm && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-1 flex items-center gap-2">
              <LayoutTemplate className="h-3.5 w-3.5" />
              Basemap
            </h3>
            <p className="text-[10px] text-surface-400 mb-2 leading-tight px-1">
              Base contextual map style.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setBaseMap('street')}
                className={cn("border-2 rounded-md overflow-hidden relative group", baseMap === 'street' ? "border-rose-500" : "border-transparent hover:border-surface-300")}
              >
                <div className="aspect-video bg-surface-100 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                  <MapIcon className="h-4 w-4 text-surface-400" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-white/90 text-[10px] font-medium py-1 px-1 border-t border-surface-200">
                  Street Map
                </div>
              </button>
              <button
                onClick={() => setBaseMap('topo')}
                className={cn("border-2 rounded-md overflow-hidden relative group transition-colors", baseMap === 'topo' ? "border-rose-500" : "border-transparent hover:border-surface-300 opacity-80 hover:opacity-100")}
                title="Topographic map"
              >
                <div className="aspect-video flex items-center justify-center relative bg-emerald-50">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')] opacity-30"></div>
                  <LayoutTemplate className="h-4 w-4 text-emerald-600 relative z-10" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-white/90 text-surface-900 text-[10px] font-medium py-1 px-1 border-t border-surface-200">
                  Topographic
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
                <div className="absolute inset-x-0 bottom-0 bg-surface-900/90 text-white text-[10px] font-medium py-1 px-1 border-t border-surface-700">
                  Satellite
                </div>
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
               <span className="text-xs font-semibold text-surface-700">Terrain Hillshade</span>
               <button
                 role="switch"
                 aria-checked={showHillshade}
                 aria-label="Toggle Terrain Hillshade"
                 onClick={() => setShowHillshade(!showHillshade)}
                 className={cn("w-9 h-5 rounded-full flex items-center px-0.5 transition-colors", showHillshade ? "bg-rose-500" : "bg-surface-300")}
               >
                 <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform", showHillshade ? "translate-x-4" : "translate-x-0")} />
               </button>
            </div>
            
            <div className="mt-4 flex flex-col px-1 pt-3 border-t border-surface-200">
               <div className="flex items-center justify-between pointer-events-auto">
                 <span className="text-xs font-semibold text-surface-700 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-500" /> Historical Imagery (EE)</span>
                 <button
                   role="switch"
                   aria-checked={!!historicalYear}
                   aria-label="Toggle Historical Imagery"
                   onClick={() => setHistoricalYear(historicalYear ? null : 2020)}
                   className={cn("w-9 h-5 rounded-full flex items-center px-0.5 transition-colors", historicalYear ? "bg-rose-500" : "bg-surface-300")}
                 >
                   <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform", historicalYear ? "translate-x-4" : "translate-x-0")} />
                 </button>
               </div>
               {historicalYear && !import.meta.env.VITE_EE_API_KEY && (
                 <div className="mt-2 text-[10px] text-amber-600 font-medium">
                   VITE_EE_API_KEY is not set. Please add your Google Earth Engine API Key to use this layer.
                 </div>
               )}
               {historicalYear && import.meta.env.VITE_EE_API_KEY && (
                 <div className="mt-3 text-xs">
                   <input 
                     type="range" 
                     min="1984" 
                     max="2023" 
                     step="1" 
                     value={historicalYear}
                     onChange={(e) => setHistoricalYear(parseInt(e.target.value, 10))}
                     className="w-full h-1.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                   />
                   <div className="flex justify-between mt-1 text-[10px] text-surface-500 font-medium font-mono">
                     <span>1984</span>
                     <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">{historicalYear}</span>
                     <span>2023</span>
                   </div>
                 </div>
               )}
            </div>
          </section>
        )}

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
              name: "City of Cape Town (ERF)",
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
            {
              id: "osm_geofabrik_sa",
              name: "OSM Base (South Africa)",
              color: "text-emerald-500",
            },
          ],
        )}

        {renderLayerGroup(
          "Western Cape",
          <Layers className="h-3.5 w-3.5 text-blue-600" />,
          "Province-wide datasets.",
          [
            {
              id: "wcgp-cadastre-vector",
              name: "Western Cape Cadastre",
              color: "text-rose-500",
            },
            {
              id: "wcgp-zoning",
              name: "Western Cape Zoning",
              color: "text-blue-500",
            },
            {
              id: "wcgp-topo",
              name: "Western Cape Topographic Map",
              color: "text-emerald-500",
            },
            {
              id: "wcgp-aerial",
              name: "Western Cape Aerial Imagery",
              color: "text-blue-500",
            },
          ],
        )}

        {/* Private Data Import Section (Tenant Only) */}
        {profile?.tenantId && (
          <section className="bg-indigo-50/50 -mx-4 px-4 py-4 border-y border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 flex items-center gap-2">
                <FileStack className="h-3.5 w-3.5" />
                Private Tenant Data
              </h3>
              <div className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                TENANT SC OPED
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-[9px] text-indigo-600/70 leading-relaxed">
                Imported GeoJSON layers are isolated to <strong>{profile.fullName || 'Organization'}</strong>.
              </div>

              {renderLayerGroup(
                "Custom Overlays",
                <FolderOpen className="h-3.5 w-3.5" />,
                "Your imported GeoJSON datasets.",
                [
                  {
                    id: "imported_geojson",
                    name: "Imported GeoJSON",
                    color: "text-indigo-500",
                  },
                ],
              )}
              
              <div className="grid grid-cols-1 gap-2 mt-4">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-[10px] h-8 border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-600 font-bold border-dashed"
                   onClick={() => document.getElementById('geojson-import-input')?.click()}
                 >
                   <Plus className="w-3 h-3 mr-1" /> Import GeoJSON
                 </Button>
                 <input 
                   id="geojson-import-input"
                   type="file" 
                   accept=".geojson,application/geo+json"
                   className="hidden"
                   onChange={async (e) => {
                     const file = e.target.files?.[0];
                     if (file && profile.tenantId) {
                        try {
                          await importGeoJSON(file, profile.tenantId);
                          alert('Layer imported successfully.');
                        } catch (err: any) {
                          alert('Import failed: ' + err.message);
                        }
                     }
                   }}
                 />
              </div>

              {isImporting && (
                <div className="flex items-center gap-2 text-[10px] text-indigo-600 animate-pulse font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" /> Processing geometry...
                </div>
              )}
            </div>
          </section>
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
          "Your custom saved maps and drawings.",
          [
            {
               id: "user_drawings",
               name: "My Drawings",
               color: "text-purple-500",
            }
          ]
        )}
      </div>
    </div>
  );
};
