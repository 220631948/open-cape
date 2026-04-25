import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router";
import Map, {
  NavigationControl,
  MapRef,
  Source,
  Layer,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { LayerPanel } from "@/src/components/map/LayerPanel";
import { MapToolbar } from "@/src/components/map/MapToolbar";
import { RightDetailDrawer } from "@/src/components/map/RightDetailDrawer";
import { ViewportStatusBar } from "@/src/components/map/ViewportStatusBar";
import { AddBookmarkDialog } from "@/src/components/map/AddBookmarkDialog";
import { SaveMapDialog } from "@/src/components/map/SaveMapDialog";
import { SourceManager } from "@/src/components/map/SourceManager";
import { ALL_SOURCES } from "@/src/sources";
import { ErfRecord } from "@/src/hooks/useErfSearch";
import { motion, AnimatePresence } from "motion/react";
import { DrawControl } from "@/src/components/map/DrawControl";
import { DrawToolbar, DrawMode } from "@/src/components/map/DrawToolbar";
import { DrawingStyleEditor } from "@/src/components/map/DrawingStyleEditor";
import { AnnotationEditor } from "@/src/components/annotations/AnnotationEditor";
import { useDrawings, Drawing, DrawingStyle } from "@/src/hooks/useDrawings";
import { useAnnotations } from "@/src/hooks/useAnnotations";
import { useSavedMaps } from "@/src/hooks/useSavedMaps";
import { getLiveErfRecord } from "@/src/source_connectors/cctOpenDataClient";
import { useProfile } from "@/src/contexts/useProfile";
import { useLayerPreferences } from "@/src/contexts/useLayerPreferences";
import { useEnvironmentalContext } from "@/src/contexts/EnvironmentalContext";
import { ActiveVectorLayer } from "@/src/components/map/ActiveVectorLayer";
import { VECTOR_LAYERS } from "@/src/hooks/useVectorLayer";
import { useOSINTVerification } from "@/src/hooks/useOSINTVerification";
import { OsintDrawer } from "@/src/components/map/OsintDrawer";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MapPin, Layers, X } from "lucide-react";
import * as turf from "@turf/turf";
import { cn } from "@/src/lib/utils";

const INITIAL_VIEW_STATE = {
  longitude: 18.4241, // Cape Town Center
  latitude: -33.9249,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

const DEFAULT_STYLE: DrawingStyle = {
  stroke: "#E11D48", // rose-600
  strokeWidth: 2,
  fill: "#E11D48",
  fillOpacity: 0.1,
};

export const MapPage = () => {
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw>(null);
  const location = useLocation();

  const { drawings, createDrawing, updateDrawing, deleteDrawing } =
    useDrawings();
  const { createAnnotation } = useAnnotations();
  const { savedMaps } = useSavedMaps();
  const { profile } = useProfile();
  const { preferences: layerPrefs } = useLayerPreferences();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedErf, setSelectedErf] = useState<ErfRecord | null>(null);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [saveMapDialogOpen, setSaveMapDialogOpen] = useState(false);
  const [showBuffer, setShowBuffer] = useState(false);
  const [bufferFeature, setBufferFeature] = useState<any>(null);
  const [popupInfo, setPopupInfo] = useState<{lngLat: [number, number], feature: any, layerId: string} | null>(null);

  // Drawing state
  const [drawMode, setDrawMode] = useState<DrawMode>("select");
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(
    null,
  );
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false);
  
  // OSINT state
  const [osintPending, setOsintPending] = useState<{layerId: string, feature: any} | null>(null);
  const [osintDrawerInfo, setOsintDrawerInfo] = useState<{layerId: string, feature: any} | null>(null);
  const { saveVerification } = useOSINTVerification();

  const [editingDrawing, setEditingDrawing] = useState<{
    title: string;
    style: DrawingStyle;
  } | null>(null);

  const [isFetchingFeature, setIsFetchingFeature] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [oamHealth, setOamHealth] = useState<'healthy'|'degraded'|'offline'>('healthy');
  const [oamErrorMsg, setOamErrorMsg] = useState<string | null>(null);

  const { activeLayers: eeActiveLayers, opacities: eeOpacities } = useEnvironmentalContext();

  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({});
  const [baseMap, setBaseMap] = useState<"street" | "satellite">("street");
  const { updatePreferences } = useLayerPreferences();

  const [mobileLayerPanelOpen, setMobileLayerPanelOpen] = useState(false);

  // Initialize base on profile defaults
  const initialLockRef = useRef(false);
  useEffect(() => {
    if (!initialLockRef.current && profile && profile.defaultMapCenter) {
      // Only apply defaults if location.state didn't override it bounds
      const state = location.state as any;
      if (!state?.focusErf && !state?.focusDrawing && !state?.savedMapId) {
        setViewState((prev) => ({
          ...prev,
          latitude: profile.defaultMapCenter.lat,
          longitude: profile.defaultMapCenter.lng,
          zoom: profile.defaultZoom || 12,
        }));
      }
      if (layerPrefs?.defaultViews) {
        setActiveLayers(layerPrefs.defaultViews);
      } else if (profile?.preferredLayers) {
        setActiveLayers(profile.preferredLayers);
      }
      if (layerPrefs?.opacities) {
        setLayerOpacities(layerPrefs.opacities);
      }
      initialLockRef.current = true;
    }
  }, [profile, layerPrefs, location.state]);

  const handleToggleLayer = (layerId: string) => {
    setActiveLayers((prev) => {
      const next = prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId];
      // Opt-in background sync to user preferences (could debounce this in production)
      if (layerPrefs) {
        updatePreferences({ defaultViews: next });
      }
      return next;
    });
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayerOpacities(prev => {
      const next = { ...prev, [layerId]: opacity };
      if (layerPrefs) {
         updatePreferences({ opacities: next });
      }
      return next;
    });
  };

  useEffect(() => {
    if (showBuffer && selectedErf?.geometry) {
      try {
        const buffered = turf.buffer(selectedErf.geometry as turf.Geometry, 50, { units: 'meters' });
        setBufferFeature(buffered);
      } catch (e) {
        console.error("Buffer error", e);
        setBufferFeature(null);
      }
    } else {
      setBufferFeature(null);
    }
  }, [showBuffer, selectedErf]);

  // Focus ERF handling from Search or Saved Map
  useEffect(() => {
    const state = location.state as {
      focusErf?: ErfRecord;
      focusDrawing?: Drawing;
      savedMapId?: string;
      showBuffer?: boolean;
    };

    if (state?.showBuffer) {
      setShowBuffer(true);
    }

    if (state?.savedMapId && savedMaps.length > 0) {
      const sm = savedMaps.find((m) => m.id === state.savedMapId);
      if (sm) {
        setViewState({
          longitude: sm.viewport.longitude,
          latitude: sm.viewport.latitude,
          zoom: sm.viewport.zoom,
          pitch: sm.viewport.pitch || 0,
          bearing: sm.viewport.bearing || 0,
        });
        // TODO: Apply visible layers based on sm.visibleLayers
      }
    } else if (state?.focusErf) {
      setSelectedErf(state.focusErf);
      const { lat, lng } = state.focusErf.center;
      // Pan to the selected ERF smoothly
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 17,
        duration: 1500,
        essential: true,
      });
      // Optionally open the right drawer anticipating user wants details
      setDrawerOpen(true);
    } else if (state?.focusDrawing) {
      const drawing = state.focusDrawing;
      let center: [number, number] = [18.4241, -33.9249];
      if (drawing.geometryType === "Point") {
        center = drawing.geometry.coordinates;
      } else if (
        drawing.geometryType === "LineString" ||
        drawing.geometryType === "Polygon"
      ) {
        center =
          drawing.geometryType === "Polygon"
            ? drawing.geometry.coordinates[0][0]
            : drawing.geometry.coordinates[0];
      }
      mapRef.current?.flyTo({
        center,
        zoom: 16,
        duration: 1500,
        essential: true,
      });
    }
  }, [location.state, savedMaps]);

  // Sync existing drawings with MapboxDraw
  useEffect(() => {
    if (drawRef.current && drawings) {
      const draw = drawRef.current;
      const currentIds = draw.getAll().features.map((f) => f.id);
      const dbDrawingIds = drawings.map((d) => d.id);

      const showDrawings = activeLayers.includes("user_drawings");

      if (showDrawings) {
        // Add or update existing drawings
        drawings.forEach((d) => {
          if (!currentIds.includes(d.id)) {
            draw.add({
              id: d.id,
              type: "Feature",
              properties: { ...d.style, title: d.title },
              geometry: d.geometry,
            });
          } else {
            // Update existing feature properties
            draw.setFeatureProperty(d.id, "title", d.title);
            if (d.style) {
              Object.entries(d.style).forEach(([k, v]) => {
                draw.setFeatureProperty(d.id, k, v);
              });
            }
          }
        });

        // Remove deleted drawings
        currentIds.forEach((id) => {
          if (id && !dbDrawingIds.includes(id as string)) {
            draw.delete(id as string);
          }
        });
      } else {
        // Hide all drawings
        currentIds.forEach((id) => {
          if (id) draw.delete(id as string);
        });
      }
    }
  }, [drawings, activeLayers]);

  const onMove = useCallback((evt: any) => {
    setViewState(evt.viewState);
  }, []);

  const handleModeChange = (mode: DrawMode) => {
    setDrawMode(mode);
    if (!drawRef.current) return;

    if (mode !== "select" && !activeLayers.includes("user_drawings")) {
      setActiveLayers((prev) => [...prev, "user_drawings"]);
    }

    switch (mode) {
      case "select":
        drawRef.current.changeMode("simple_select");
        break;
      case "point":
        drawRef.current.changeMode("draw_point");
        break;
      case "line":
        drawRef.current.changeMode("draw_line_string");
        break;
      case "polygon":
        drawRef.current.changeMode("draw_polygon");
        break;
    }
  };

  const onDrawCreate = async (evt: any) => {
    const feature = evt.features[0];
    const newDrawingId = await createDrawing({
      title: "New Drawing",
      geometryType: feature.geometry.type,
      geometry: feature.geometry,
      style: DEFAULT_STYLE,
      privacy: "private",
      sourceRefs: [],
    });
    // Sync the Draw ID with our DB ID
    drawRef.current?.delete(feature.id);
    drawRef.current?.add({
      ...feature,
      id: newDrawingId,
      properties: { ...DEFAULT_STYLE, title: "New Drawing" },
    });
    setDrawMode("select");
  };

  const onDrawUpdate = async (evt: any) => {
    const feature = evt.features[0];
    if (feature.id) {
      await updateDrawing(feature.id as string, {
        geometry: feature.geometry,
        geometryType: feature.geometry.type,
      });
    }
  };

  const onSelectionChange = (evt: any) => {
    const feature = evt.features[0];
    if (feature) {
      setSelectedDrawingId(feature.id as string);
      const d = drawings.find((draw) => draw.id === feature.id);
      if (d) {
        setEditingDrawing({ title: d.title, style: d.style });
      }
    } else {
      setSelectedDrawingId(null);
      setEditingDrawing(null);
      setShowStyleEditor(false);
      setShowAnnotationEditor(false);
    }
  };

  const handleDeleteDrawing = async () => {
    if (selectedDrawingId) {
      if (window.confirm("Are you sure you want to delete this drawing?")) {
        await deleteDrawing(selectedDrawingId);
        drawRef.current?.delete(selectedDrawingId);
        setSelectedDrawingId(null);
      }
    }
  };

  const handleSaveDrawingProps = async () => {
    if (selectedDrawingId && editingDrawing) {
      await updateDrawing(selectedDrawingId, {
        title: editingDrawing.title,
        style: editingDrawing.style,
      });
      // Update properties in MapboxDraw for immediate visual feedback
      drawRef.current?.setFeatureProperty(
        selectedDrawingId,
        "title",
        editingDrawing.title,
      );
      Object.entries(editingDrawing.style).forEach(([k, v]) => {
        drawRef.current?.setFeatureProperty(selectedDrawingId, k, v);
      });
      setShowStyleEditor(false);
    }
  };

  const handleSaveAnnotation = async (data: any) => {
    if (selectedDrawingId) {
      await createAnnotation({
        ...data,
        targetType: "drawing",
        targetId: selectedDrawingId,
      });
      setShowAnnotationEditor(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-surface-50 overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Layer Panel */}
        <AnimatePresence>
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "absolute inset-y-0 left-0 z-30 md:static md:block shrink-0 bg-white md:bg-transparent shadow-xl md:shadow-none h-full",
              mobileLayerPanelOpen ? "block" : "hidden"
            )}
          >
            {/* Mobile close button inside the drawer */}
            {mobileLayerPanelOpen && (
               <button 
                  className="absolute top-3 right-3 z-50 md:hidden p-2 bg-surface-100 rounded-full text-surface-600 hover:text-surface-900 shadow-sm"
                  onClick={() => setMobileLayerPanelOpen(false)}
               >
                 <X className="w-5 h-5" />
               </button>
            )}
            <LayerPanel
              activeLayers={activeLayers}
              onToggleLayer={handleToggleLayer}
              baseMap={baseMap}
              setBaseMap={setBaseMap}
              layerOpacities={layerOpacities}
              onOpacityChange={handleOpacityChange}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile backdrop */}
        <AnimatePresence>
          {mobileLayerPanelOpen && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/20 z-20 md:hidden"
               onClick={() => setMobileLayerPanelOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Map Canvas Region */}
        <div className="flex-1 relative flex flex-col min-w-0">
          <div className="flex-1 relative w-full h-full">
            <Map
              ref={mapRef}
              {...viewState}
              onMove={onMove}
              onLoad={() => setIsMapLoading(false)}
              onData={(e) => {
                if (e.dataType === 'source' && e.isSourceLoaded) {
                  // Small delay to ensure smooth transition
                  setTimeout(() => setIsMapLoading(false), 300);
                } else if (e.dataType === 'source') {
                  setIsMapLoading(true);
                }
              }}
              mapStyle={baseMap === 'satellite' ? "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json" : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}
              interactiveLayerIds={activeLayers.map(id => `layer-${id}`)}
              onClick={async (evt) => {
                if (drawMode !== "select") return;

                if (osintPending) {
                   const reason = window.prompt("Reason for verification/override:");
                   if (reason) {
                      const fId = osintPending.feature.properties.OBJECTID || osintPending.feature.properties.id;
                      try {
                        await saveVerification(
                          osintPending.layerId.replace('layer-', ''), 
                          fId.toString(), 
                          osintPending.feature.geometry.coordinates, 
                          [evt.lngLat.lng, evt.lngLat.lat], 
                          reason
                        );
                        window.alert('Location verified & overridden successfully.');
                      } catch(e) {
                        window.alert('Failed to save verified location: ' + String(e));
                      }
                   }
                   setOsintPending(null);
                   return;
                }

                // Handle clicks on interactive vector layers (point layers)
                if (evt.features && evt.features.length > 0) {
                  const feature = evt.features[0];
                  // Ensure we clicked a layer we injected and not something else
                  if (feature.layer.id.startsWith("layer-")) {
                    setPopupInfo({
                      lngLat: [evt.lngLat.lng, evt.lngLat.lat],
                      feature: feature,
                      layerId: feature.layer.id
                    });
                    return;
                  }
                }
                
                // Clicking off vector layers clears it
                setPopupInfo(null);

                const { lng, lat } = evt.lngLat;
                try {
                  setIsFetchingFeature(true);
                  const liveFeature = await getLiveErfRecord(lng, lat);
                  if (liveFeature) {
                    setSelectedErf(liveFeature);
                    setDrawerOpen(true);
                  } else {
              // Graceful fallback: Show standard location context but indicate source is offline
              setSelectedErf({
                id: `loc-${lat.toFixed(4)}-${lng.toFixed(4)}`,
                objectId: 0,
                erfNumber: "Not available from source",
                allotmentArea: "Not available from source",
                address: null,
                center: { lat, lng },
                status: "offline",
                zoning: "Not available from source",
                zoningCategory: "Unknown",
                geometry: {
                  type: "Point",
                  coordinates: [lng, lat],
                },
                properties: {}
              } as any);
              setDrawerOpen(true);
            }
          } catch (e) {
            console.error(e);
            setSelectedErf(null);
            setDrawerOpen(false);
          } finally {
            setIsFetchingFeature(false);
          }
        }}
        onError={(e) => {
          if (e.error?.message?.includes('openaerialmap.org') || typeof e.error?.message === 'string' && e.error.message.includes('tiles.openaerialmap.org')) {
             if (oamHealth !== 'offline') {
               console.warn('OAM tile failure caught. Disabling layer automatically.');
               setOamHealth('offline');
               setOamErrorMsg('Warning: OAM tile failure caught. Disabling layer automatically. Local Aerial imagery temporarily unavailable. Try NASA GIBS or ESRI Satellite.');
               // Remove OAM from active layers so it stops fetching and spamming errors
               setActiveLayers(prev => prev.filter(Id => Id !== 'openaerialmap'));
             }
          }
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {baseMap === 'satellite' && (
          <Source id="esri-world-imagery" type="raster" tiles={['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']} tileSize={256} maxzoom={19}>
            <Layer id="esri-world-imagery-layer" type="raster" paint={{ "raster-opacity": 1 }} />
          </Source>
        )}
        
        <SourceManager 
           sources={ALL_SOURCES} 
           activeLayerIds={[...activeLayers, ...eeActiveLayers]} 
        />
        
        <NavigationControl position="bottom-left" showCompass={false} />
              <DrawControl
                ref={drawRef}
                onCreate={onDrawCreate}
                onUpdate={onDrawUpdate}
                onSelectionChange={onSelectionChange}
              />

              {/* Selected ERF highlight */}
              {selectedErf?.zoningFeature?.geometry && (
                <Source
                  id="selected-erf-zoning-source"
                  type="geojson"
                  data={{
                    type: "FeatureCollection",
                    features: [
                      {
                        type: "Feature",
                        geometry: selectedErf.zoningFeature.geometry,
                        properties: {},
                      },
                    ],
                  }}
                >
                  <Layer
                    id="selected-erf-zoning-fill"
                    type="fill"
                    paint={{
                      "fill-color": "#f59e0b", // amber-500
                      "fill-opacity": 0.2,
                      "fill-pattern": null
                    } as any}
                  />
                  <Layer
                    id="selected-erf-zoning-line"
                    type="line"
                    paint={{
                      "line-color": "#f59e0b", // amber-500
                      "line-width": 2,
                      "line-dasharray": [2, 2]
                    }}
                  />
                </Source>
              )}
              {selectedErf?.geometry && (
                <Source
                  id="selected-erf-source"
                  type="geojson"
                  data={{
                    type: "FeatureCollection",
                    features: [
                      {
                        type: "Feature",
                        geometry: selectedErf.geometry,
                        properties: {},
                      },
                    ],
                  }}
                >
                  <Layer
                    id="selected-erf-fill"
                    type="fill"
                    paint={{
                      "fill-color": "#0284c7", // sky-600
                      "fill-opacity": 0.1
                    }}
                  />
                  <Layer
                    id="selected-erf-line"
                    type="line"
                    paint={{
                      "line-color": "#0284c7", // sky-600
                      "line-width": 2,
                    }}
                  />
                </Source>
              )}

              {/* Buffer Layer */}
              {showBuffer && bufferFeature && (
                <Source
                  id="buffer-source"
                  type="geojson"
                  data={bufferFeature}
                >
                  <Layer
                    id="buffer-fill"
                    type="fill"
                    paint={{
                      "fill-color": "#8b5cf6", // violet-500
                      "fill-opacity": 0.15,
                    }}
                  />
                  <Layer
                    id="buffer-line"
                    type="line"
                    paint={{
                      "line-color": "#8b5cf6", // violet-500
                      "line-width": 2,
                      "line-dasharray": [2, 2],
                    }}
                  />
                </Source>
              )}

              {VECTOR_LAYERS.map(layer => (
                activeLayers.includes(layer.id) ? (
                  <ActiveVectorLayer key={layer.id} layerId={layer.id} opacity={layerOpacities[layer.id] ?? 1} />
                ) : null
              ))}

              {popupInfo && (
                <Popup
                  longitude={popupInfo.lngLat[0]}
                  latitude={popupInfo.lngLat[1]}
                  anchor="bottom"
                  onClose={() => setPopupInfo(null)}
                  closeOnClick={false}
                  className="z-50"
                  maxWidth="300px"
                >
                  <div className="p-2 space-y-2 text-sm text-surface-900 max-h-64 overflow-y-auto w-64">
                    <h4 className="font-bold border-b border-surface-200 pb-1 mb-1 text-surface-700 capitalize">
                      {popupInfo.layerId.replace("layer-", "").replace("_", " ")} Feature
                    </h4>
                    {(() => {
                        let osint: any = null;
                        if (typeof popupInfo.feature.properties._osint === 'string') {
                           try { osint = JSON.parse(popupInfo.feature.properties._osint); } catch (e) {}
                        } else if (popupInfo.feature.properties._osint) {
                           osint = popupInfo.feature.properties._osint;
                        }

                        return (
                          <>
                            {osint && (
                              <div className="mt-2 p-2 bg-surface-100 border border-surface-200 rounded-md text-[10px]">
                                <div className="font-bold text-surface-900 mb-1 flex items-center justify-between">
                                  <span>Provenance & OSINT</span>
                                  <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded capitalize">{osint.verificationStatus?.replace(/-/g, ' ')}</span>
                                </div>
                                <div className="space-y-1 text-surface-600">
                                  <div><span className="font-medium text-surface-500">Source:</span> <a href={osint.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{osint.sourceName}</a></div>
                                  <div><span className="font-medium text-surface-500">Type:</span> {osint.sourceType}</div>
                                  <div><span className="font-medium text-surface-500">Geometry:</span> <span className="capitalize">{osint.displayMode?.replace(/-/g, ' ')}</span></div>
                                  <div><span className="font-medium text-surface-500">Notes:</span> {osint.verificationNotes}</div>
                                </div>
                              </div>
                            )}
                            <div className="space-y-1 mt-2 border-t border-surface-200 pt-2">
                              {Object.entries(popupInfo.feature.properties || {}).map(([key, value]) => {
                                 // Skip shape lengths/areas, useless IDs, and our _osint payload
                                 if (key.startsWith("SHAPE") || key === "OBJECTID" || key === "_osint") return null;
                                 if (value === null || value === "") return null;
                                 return (
                                   <div key={key} className="flex flex-col mb-1">
                                     <span className="text-[10px] text-surface-500 uppercase font-semibold">
                                       {key.replace(/_/g, ' ')}
                                     </span>
                                     <span className="text-xs font-medium">
                                       {key === 'isVerified' ? '✅ Verified by Analyst' : String(value)}
                                     </span>
                                   </div>
                                 )
                              })}
                            </div>
                          </>
                        );
                    })()}
                    <div className="mt-2 flex gap-2">
                       <button 
                         onClick={() => {
                           // Set the map state
                           setBookmarkDialogOpen(true);
                           // To pass feature id, we can just use the standard bookmark
                         }}
                         className="flex-1 bg-surface-100 border border-surface-200 text-surface-700 text-xs px-2 py-1.5 rounded-md hover:bg-surface-200 font-medium"
                       >
                         Bookmark
                       </button>
                       {profile?.role === 'analyst' && (
                         <button 
                           onClick={() => {
                             setOsintDrawerInfo({layerId: popupInfo.layerId, feature: popupInfo.feature});
                             setPopupInfo(null);
                           }}
                           className="flex-1 bg-indigo-600 text-white text-xs px-2 py-1.5 rounded-md hover:bg-indigo-700 font-medium"
                         >
                           Verify (OSINT)
                         </button>
                       )}
                    </div>
                  </div>
                </Popup>
              )}
            </Map>

            {osintPending && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="bg-indigo-600 text-white font-medium shadow-lg rounded-full px-4 py-2 text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Click on map to set corrected location for {osintPending.layerId.replace("layer-", "")} feature.
                  <button onClick={() => setOsintPending(null)} className="pointer-events-auto ml-2 underline hover:text-indigo-200">Cancel</button>
                </div>
              </div>
            )}

            {/* Drawing Toolbar */}
            <div className="absolute top-4 left-4 z-20">
              <DrawToolbar
                activeMode={drawMode}
                onModeChange={handleModeChange}
                isSelected={!!selectedDrawingId}
                onDelete={handleDeleteDrawing}
                onProperties={() => setShowStyleEditor(!showStyleEditor)}
                onAnnotate={() =>
                  setShowAnnotationEditor(!showAnnotationEditor)
                }
                hasSelectedParcel={!!selectedErf}
                showBuffer={showBuffer}
                onToggleBuffer={() => setShowBuffer(!showBuffer)}
              />
            </div>

            {/* Floating Editors */}
            {selectedDrawingId && editingDrawing && (
              <div className="absolute top-4 left-16 z-30 pointer-events-none flex flex-col gap-4">
                {showStyleEditor && (
                  <div className="pointer-events-auto">
                    <DrawingStyleEditor
                      title={editingDrawing.title}
                      style={editingDrawing.style}
                      onTitleChange={(t) =>
                        setEditingDrawing({ ...editingDrawing, title: t })
                      }
                      onStyleChange={(s) =>
                        setEditingDrawing({ ...editingDrawing, style: s })
                      }
                      onSave={handleSaveDrawingProps}
                      onClose={() => setShowStyleEditor(false)}
                    />
                  </div>
                )}
                {showAnnotationEditor && (
                  <div className="pointer-events-auto">
                    <AnnotationEditor
                      targetType="drawing"
                      targetId={selectedDrawingId}
                      onSave={handleSaveAnnotation}
                      onClose={() => setShowAnnotationEditor(false)}
                    />
                  </div>
                )}
              </div>
            )}

        {/* Simulated empty state overlay for unlinked datasets */}
        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
          <AnimatePresence>
            {isMapLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-0.5 bg-rose-500/30 overflow-hidden"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="h-full w-1/3 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
          <AnimatePresence>
            {isFetchingFeature && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white/95 backdrop-blur-md border border-surface-200 shadow-lg rounded-full px-5 py-2 text-xs font-bold text-surface-900 shadow-rose-900/10 flex items-center gap-3 pointer-events-auto"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse [animation-delay:0.4s]"></span>
                </div>
                <span>Querying Cadastre Source...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isFetchingFeature && !activeLayers.filter(l => VECTOR_LAYERS.map(v => v.id).includes(l)).length && !eeActiveLayers.length && (
            <div className="bg-white/90 backdrop-blur border border-surface-200 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-surface-600 shadow-surface-900/5">
              Basemap mode • No analytical layers active
            </div>
          )}
          
          {oamErrorMsg && (
            <div className="bg-rose-50/95 backdrop-blur border border-rose-200 shadow-md rounded-md px-3 py-2 text-xs font-medium text-rose-700 shadow-surface-900/5 max-w-[300px] text-center pointer-events-auto flex items-center justify-between gap-3">
              <span>{oamErrorMsg}</span>
              <button onClick={() => setOamErrorMsg(null)} className="text-rose-500 hover:text-rose-800 text-lg leading-none">&times;</button>
            </div>
          )}

          {baseMap === 'satellite' && (
            <div className="bg-white/90 backdrop-blur border border-surface-200 shadow-sm rounded-md px-3 py-2 text-[10px] text-surface-700 shadow-md max-w-[280px] text-center pointer-events-auto">
               <strong className="block text-surface-900 mb-1">Satellite Imagery (NASA GIBS / OpenAerialMap)</strong>
               <p className="mb-1 leading-tight">Type: True Color Corrected Reflectance (Terra MODIS) & OpenAerialMap</p>
               <p className="mb-1 leading-tight text-surface-500">Updates: Open coverage and daily global coverage.</p>
               <p className="text-rose-600 font-medium leading-tight border-t border-surface-200 pt-1 mt-1">
                 Imagery is contextual and does not replace official cadastral or planning records.
               </p>
            </div>
          )}
        </div>

            {/* Right side floating tools */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-4 pointer-events-auto">
              <button
                className="md:hidden bg-white text-surface-700 hover:text-rose-600 border border-surface-200 shadow-sm p-2 rounded-lg flex items-center justify-center transition-colors"
                onClick={() => setMobileLayerPanelOpen(true)}
                title="Layers"
              >
                <Layers className="w-5 h-5" />
              </button>
              <MapToolbar
                onBookmarkClick={() => setBookmarkDialogOpen(true)}
                onSaveMapClick={() => setSaveMapDialogOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Detail Drawer Overlay */}
        <AnimatePresence mode="wait">
          {(drawerOpen || osintDrawerInfo) && (
            <motion.div
              key={osintDrawerInfo ? 'osint' : 'detail'}
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="absolute inset-y-0 right-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] h-full pointer-events-auto md:static md:shadow-none bg-white w-full sm:w-[320px] flex flex-col"
            >
              <RightDetailDrawer
                isOpen={drawerOpen && !osintDrawerInfo}
                setIsOpen={setDrawerOpen}
                feature={selectedErf}
                showBuffer={showBuffer}
                setShowBuffer={setShowBuffer}
              />
              <OsintDrawer
                isOpen={!!osintDrawerInfo && !osintPending}
                onClose={() => setOsintDrawerInfo(null)}
                featureInfo={osintDrawerInfo}
                onInitiateLocationCorrection={() => {
                   setOsintPending(osintDrawerInfo);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddBookmarkDialog
        isOpen={bookmarkDialogOpen}
        onClose={() => setBookmarkDialogOpen(false)}
        currentFeatureId={popupInfo?.feature.properties?.id || popupInfo?.feature.properties?.OBJECTID || selectedErf?.id}
        mapState={{
          zoom: viewState.zoom,
          lat: viewState.latitude,
          lng: viewState.longitude,
        }}
      />

      <SaveMapDialog
        isOpen={saveMapDialogOpen}
        onClose={() => setSaveMapDialogOpen(false)}
        viewport={viewState}
        visibleLayers={[]} // We aren't fully managing layer state yet
      />

      {/* Bottom Status Bar */}
      <ViewportStatusBar
        zoom={viewState.zoom}
        lat={viewState.latitude}
        lng={viewState.longitude}
      />
    </div>
  );
};
