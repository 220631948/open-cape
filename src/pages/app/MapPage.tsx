/* eslint-disable no-restricted-syntax, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router";
import Map, {
  MapRef,
  Source,
  Layer,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { LayerPanel } from "@/src/components/map/LayerPanel";
import { RightDetailDrawer } from "@/src/components/map/RightDetailDrawer";
import { ViewportStatusBar } from "@/src/components/map/ViewportStatusBar";
import { AddBookmarkDialog } from "@/src/components/map/AddBookmarkDialog";
import { SaveMapDialog } from "@/src/components/map/SaveMapDialog";
import { SourceManager } from "@/src/components/map/SourceManager";
import { ALL_SOURCES } from "@/src/sources";
import { useProjects } from "@/src/hooks/useProjects";
import { ErfRecord, useErfSearch } from "@/src/hooks/useErfSearch";
import { motion, AnimatePresence } from "motion/react";
import { DrawControl } from "@/src/components/map/DrawControl";
import { DrawToolbar, DrawMode } from "@/src/components/map/DrawToolbar";
import { DrawingStyleEditor } from "@/src/components/map/DrawingStyleEditor";
import { AnnotationEditor } from "@/src/components/annotations/AnnotationEditor";
import { MapSearch } from "@/src/components/map/MapSearch";
import { SpatialCommandBar } from "@/src/components/ai/SpatialCommandBar";
import { MarketChatPanel } from "@/src/components/ai/MarketChatPanel";
import { FilterPanel } from "@/src/components/map/FilterPanel";
import { SpatialQueryFilters } from "@/src/services/geminiService";
import { useDrawings, Drawing, DrawingStyle } from "@/src/hooks/useDrawings";
import { useAnnotations, Annotation } from "@/src/hooks/useAnnotations";
import { AnnotationCard } from "@/src/components/annotations/AnnotationCard";
import { useSavedMaps } from "@/src/hooks/useSavedMaps";
import { getLiveErfRecord } from "@/src/source_connectors/cctOpenDataClient";
import { useProfile } from "@/src/contexts/useProfile";
import { useLayerPreferences } from "@/src/contexts/useLayerPreferences";
import { useEnvironmentalContext } from "@/src/contexts/EnvironmentalContext";
import { ActiveVectorLayer } from "@/src/components/map/ActiveVectorLayer";
import { FeaturePopup } from "@/src/components/map/FeaturePopup";
import { VECTOR_LAYERS } from "@/src/hooks/useVectorLayer";
import { useOSINTVerification } from "@/src/hooks/useOSINTVerification";
import { useImportedGeoJsonLayers } from "@/src/hooks/useImportedGeoJsonLayers";
import { OsintDrawer } from "@/src/components/map/OsintDrawer";
import { SearchBar } from "@/src/components/map/SearchBar";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MapPin, Layers, X, Filter } from "lucide-react";
import * as turf from "@turf/turf";
import { cn } from "@/src/lib/utils";

const INITIAL_VIEW_STATE = {
  longitude: 19.0, // Western Cape approximate center
  latitude: -33.5,
  zoom: 6,
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
  const { fetchErfDetails } = useErfSearch();
  const { projects } = useProjects();

  const { drawings, createDrawing, updateDrawing, deleteDrawing } =
    useDrawings();
  const { annotations, createAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations();
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
  const { importedLayers } = useImportedGeoJsonLayers(profile?.tenantId);

  const [editingDrawing, setEditingDrawing] = useState<{
    title: string;
    style: DrawingStyle;
  } | null>(null);

  const [editingNote, setEditingNote] = useState<Annotation | null>(null);

  const [isFetchingFeature, setIsFetchingFeature] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [oamHealth, setOamHealth] = useState<'healthy'|'degraded'|'offline'>('healthy');
  const [oamErrorMsg, setOamErrorMsg] = useState<string | null>(null);
  const [showPriceHeatmap, setShowPriceHeatmap] = useState(false);
  const [showMarketChat, setShowMarketChat] = useState(false);

  const { activeLayers: eeActiveLayers } = useEnvironmentalContext();

  const [activeLayers, setActiveLayers] = useState<string[]>(['wcgp-cadastre-vector']);
  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({});
  const [baseMap, setBaseMap] = useState<"street" | "satellite" | "topo">("street");
  const [showHillshade, setShowHillshade] = useState(false);
  const [historicalYear, setHistoricalYear] = useState<number | null>(null);
  const { updatePreferences } = useLayerPreferences();

  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

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
        const buffered = turf.buffer(selectedErf.geometry as any, 50, { units: 'meters' });
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
      if (editingNote) {
        await updateAnnotation(editingNote.id, data);
      } else {
        await createAnnotation({
          ...data,
          targetType: "drawing",
          targetId: selectedDrawingId,
        });
      }
      setShowAnnotationEditor(false);
      setEditingNote(null);
    }
  };

  const drawingAnnotations = annotations.filter(a => a.targetId === selectedDrawingId && a.targetType === 'drawing');

  const handleSelectErfFromSearch = async (erf: ErfRecord) => {
    try {
      setIsFetchingFeature(true);
      // Fetch full details
      const fullErf = await fetchErfDetails(erf.id);
      if (fullErf) {
        setSelectedErf(fullErf);
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [fullErf.center.lng, fullErf.center.lat],
            zoom: 18,
            duration: 1000
          });
        }
        setDrawerOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingFeature(false);
    }
  };

  const handleSpatialFiltersApplied = (filters: SpatialQueryFilters) => {
    // In a full implementation, we'd apply these to the layer styling logic.
    // Given scope limitations on altering map logic directly, we trigger a representative flyTo
    if (mapRef.current) {
       // Just a visual representation of flying to a bounding box for "Cape Town"
       mapRef.current.flyTo({
          center: [18.4232, -33.918861], // Cape Town center
          zoom: 13,
          duration: 2000
       });
       // Here we would typically dispatch the filters to the SourceManager Context
       console.log("Applied spatial AI filters:", filters);
    }
  };

  const handleZoomToFitFilters = () => {
    setFilterPanelOpen(false);
    if (mapRef.current) {
       mapRef.current.fitBounds([
         [18.3, -34.4],
         [19.0, -33.5]
       ], { padding: 40, duration: 1000 });
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-surface-50 overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Layer Panel */}
        <AnimatePresence>
          {layerPanelOpen && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 z-40 bg-white shadow-2xl h-full w-[300px] block"
            >
              {/* Close button inside the drawer */}
              <button 
                 className="absolute top-3 right-3 z-50 p-2 bg-surface-100 rounded-full text-surface-600 hover:text-surface-900 shadow-sm"
                 onClick={() => setLayerPanelOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <LayerPanel
                activeLayers={activeLayers}
                onToggleLayer={handleToggleLayer}
                onReorderActiveLayers={setActiveLayers}
                baseMap={baseMap}
                setBaseMap={setBaseMap}
                showHillshade={showHillshade}
                setShowHillshade={setShowHillshade}
                historicalYear={historicalYear}
                setHistoricalYear={setHistoricalYear}
                layerOpacities={layerOpacities}
                onOpacityChange={handleOpacityChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Backdrop for Layer Panel on Mobile */}
        <AnimatePresence>
          {layerPanelOpen && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="md:hidden absolute inset-0 bg-black/20 z-30"
               onClick={() => setLayerPanelOpen(false)}
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
              interactiveLayerIds={
                // Include dynamic layer ids AND exact layer ids defined in sources
                [
                  ...activeLayers.map(id => `layer-${id}`),
                  ...ALL_SOURCES.filter(s => activeLayers.includes(s.id))
                    .flatMap(s => s.mapLibreLayers.map(l => l.id))
                ]
              }
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

                // Handle clicks on interactive vector layers
                let clickedMapFeature: any = null;
                if (evt.features && evt.features.length > 0) {
                  const feature = evt.features[0];
                  // If it's a cadastre or zoning layer, fetch granular parcel data via RightDetailDrawer logic
                  if (feature.layer.id === 'layer-wcgp-cadastre-vector' || feature.layer.id === 'layer-wcgp-zoning-vector') {
                     clickedMapFeature = feature;
                  } else {
                    // If it's one of our other defined interactive layers (schools, clinics), show popup
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
                  const liveFeature = await getLiveErfRecord(lng, lat, clickedMapFeature);
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

        {baseMap === 'topo' && (
          <Source id="opentopomap" type="raster" tiles={['https://a.tile.opentopomap.org/{z}/{x}/{y}.png']} tileSize={256} maxzoom={17}>
            <Layer id="opentopomap-layer" type="raster" paint={{ "raster-opacity": 1.0 }} />
          </Source>
        )}

        {/* Base Map AWS DEM terrain tiles for 3D/Hillshade rendering */}
        <Source
            id="aws-terrarium"
            type="raster-dem"
            tiles={["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"]}
            encoding="terrarium"
            tileSize={256}
            maxzoom={15}
        >
          {showHillshade && (
             <Layer
                id="hillshade-layer"
                type="hillshade"
                paint={{
                    "hillshade-shadow-color": "#475569",
                    "hillshade-highlight-color": "#ffffff",
                    "hillshade-accent-color": "#cbd5e1"
                }}
             />
          )}
        </Source>

        {/* Google Earth Engine Historical Imagery Overlay */}
        {historicalYear !== null && import.meta.env.VITE_EE_API_KEY && (
          <Source 
            id={`ee-historical-${historicalYear}`} 
            type="raster" 
            tiles={[`https://earthengine.googleapis.com/v1beta/projects/earthengine-public/maps/landsat-annual-${historicalYear}/tiles/{z}/{x}/{y}?key=${import.meta.env.VITE_EE_API_KEY}`]} 
            tileSize={256} 
            maxzoom={14}
          >
            <Layer id={`ee-historical-layer-${historicalYear}`} type="raster" paint={{ "raster-opacity": 0.7 }} />
          </Source>
        )}
        
        <SourceManager 
           sources={ALL_SOURCES} 
           activeLayerIds={[...activeLayers, ...eeActiveLayers]} 
           layerOpacities={layerOpacities}
        />
        
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

              {activeLayers.includes("imported_geojson") && importedLayers.map(layer => {
                const data = layer.geojson || (layer.features ? { type: "FeatureCollection", features: layer.features } : null);
                if (!data) return null;
                return (
                  <Source
                    key={`imported-${layer.id}`}
                    id={`imported-src-${layer.id}`}
                    type="geojson"
                    data={data}
                  >
                    <Layer
                      id={`imported-fill-${layer.id}`}
                      type="fill"
                      filter={["==", "$type", "Polygon"]}
                      paint={{
                        "fill-color": "#4f46e5",
                        "fill-opacity": 0.3,
                      }}
                    />
                    <Layer
                      id={`imported-line-${layer.id}`}
                      type="line"
                      filter={["any", ["==", "$type", "Polygon"], ["==", "$type", "LineString"]]}
                      paint={{
                        "line-color": "#4338ca",
                        "line-width": 2,
                      }}
                    />
                    <Layer
                      id={`imported-circle-${layer.id}`}
                      type="circle"
                      filter={["==", "$type", "Point"]}
                      paint={{
                        "circle-radius": 5,
                        "circle-color": "#4f46e5",
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff"
                      }}
                    />
                  </Source>
                );
              })}

              {popupInfo && (
                <FeaturePopup
                  popupInfo={popupInfo}
                  onClose={() => setPopupInfo(null)}
                  onBookmark={() => setBookmarkDialogOpen(true)}
                  onVerify={() => {
                    setOsintDrawerInfo({layerId: popupInfo.layerId, feature: popupInfo.feature});
                    setPopupInfo(null);
                  }}
                />
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

            {/* Layout Toggle */}
            <div className="absolute top-4 left-4 z-20 pointer-events-auto">
              <button
                className="bg-white/95 backdrop-blur-md text-surface-700 hover:text-rose-600 border border-surface-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-12 w-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                onClick={() => setLayerPanelOpen(open => !open)}
                title="Toggle Layers Panel"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Drawing Toolbar on Right */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5 items-end pointer-events-none">
              <div className="pointer-events-auto">
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
                  onBookmarkClick={() => setBookmarkDialogOpen(true)}
                  onSaveMapClick={() => setSaveMapDialogOpen(true)}
                />
              </div>
              <button 
                onClick={() => setShowPriceHeatmap(!showPriceHeatmap)}
                className={cn("bg-white border text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all pointer-events-auto",
                  showPriceHeatmap ? 'border-amber-500 text-amber-700 bg-amber-50 shadow-amber-500/20' : 'border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                )}
              >
                Price Heatmap
              </button>
              <button 
                onClick={() => setShowMarketChat(!showMarketChat)}
                className={cn("bg-white border text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all pointer-events-auto flex items-center gap-1.5",
                  showMarketChat ? 'border-indigo-500 text-indigo-700 bg-indigo-50 shadow-indigo-500/20' : 'border-surface-200 hover:bg-surface-50 text-indigo-600 hover:text-indigo-800'
                )}
              >
                AI Market Chat
              </button>
            </div>

            {/* Market Chat Panel Overlay */}
            {showMarketChat && (
              <div className="absolute bottom-6 right-6 z-50 w-80 h-96 pointer-events-auto">
                <MarketChatPanel 
                  onClose={() => setShowMarketChat(false)} 
                  viewportStats={{
                     center: [mapRef.current?.getCenter()?.lng, mapRef.current?.getCenter()?.lat],
                     zoom: mapRef.current?.getZoom(),
                     visibleBounds: mapRef.current?.getBounds()?.toArray(),
                     activeLayers: activeLayers,
                     message: "Aggregated stats for current visible bounds based on active map layers."
                  }}
                />
              </div>
            )}

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
                  <div className="pointer-events-auto flex flex-col gap-3">
                    <AnnotationEditor
                      targetType="drawing"
                      targetId={selectedDrawingId}
                      initialTitle={editingNote?.title}
                      initialBody={editingNote?.body}
                      projectId={editingNote?.projectId}
                      sourceRefs={editingNote?.sourceRefs}
                      onSave={handleSaveAnnotation}
                      onClose={() => {
                        setShowAnnotationEditor(false);
                        setEditingNote(null);
                      }}
                    />
                  </div>
                )}
                
                {/* List of existing annotations for this drawing */}
                {drawingAnnotations.length > 0 && !showAnnotationEditor && (
                  <div className="pointer-events-auto w-80 max-h-[50vh] overflow-y-auto space-y-2 pb-4 scrollbar-hide">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-surface-500 bg-white/80 backdrop-blur px-2 py-1 rounded sticky top-0 z-10 border border-surface-100 shadow-sm w-fit">
                      Linked Notes ({drawingAnnotations.length})
                    </h4>
                    {drawingAnnotations.map(anno => (
                      <AnnotationCard 
                        key={anno.id}
                        annotation={anno}
                        onEdit={(a) => {
                          setEditingNote(a);
                          setShowAnnotationEditor(true);
                        }}
                        onDelete={deleteAnnotation}
                        onView={() => {}} // Could zoom to drawing
                        projectName={projects.find(p => p.id === anno.projectId)?.title}
                      />
                    ))}
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

        {/* Search Bar & AI Command Bar */}
        <div className="absolute top-16 md:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col gap-3 w-[calc(100%-2rem)] md:w-full md:max-w-2xl">
           <div className="flex items-center gap-3 w-full pointer-events-auto">
             <div className="flex-1">
               <SearchBar onSelect={handleSelectErfFromSearch} />
             </div>
             <button 
               onClick={() => setFilterPanelOpen(true)}
               className="bg-white border border-surface-200 shadow-sm rounded-lg p-2.5 text-surface-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
               title="Advanced Filters"
             >
               <Filter className="w-5 h-5" />
             </button>
           </div>
           <div className="pointer-events-auto">
             <SpatialCommandBar onFiltersApplied={handleSpatialFiltersApplied} />
           </div>
        </div>

        {/* Floating Filter Panel Overlay */}
        <AnimatePresence>
          {filterPanelOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setFilterPanelOpen(false)}
                className="fixed inset-0 bg-surface-900/20 z-40 md:hidden backdrop-blur-sm"
              />
              {/* Panel */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute top-20 left-4 bottom-8 z-50 w-80 rounded-2xl overflow-hidden shadow-2xl border border-surface-200 pointer-events-auto hidden md:block"
              >
                <FilterPanel onClose={() => setFilterPanelOpen(false)} onZoomToFit={handleZoomToFitFilters} />
              </motion.div>

              {/* Mobile Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 h-[80vh] rounded-t-2xl overflow-hidden shadow-2xl border-t border-surface-200 md:hidden pointer-events-auto"
              >
                <FilterPanel onClose={() => setFilterPanelOpen(false)} onZoomToFit={handleZoomToFitFilters} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
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

          </div>
        </div>

        {/* Right Side: Detail Drawer Overlay */}
        <AnimatePresence mode="wait">
          {(drawerOpen || osintDrawerInfo) && (
            <motion.div
              key={osintDrawerInfo ? 'osint' : 'detail'}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="absolute bottom-0 left-0 right-0 max-h-[70vh] z-40 shadow-2xl rounded-t-xl md:inset-y-0 md:right-0 md:left-auto md:max-h-full md:rounded-l-xl md:rounded-tr-none md:shadow-[-10px_0_30px_rgba(0,0,0,0.05)] md:absolute bg-white w-full md:w-[360px] flex flex-col pointer-events-auto overflow-hidden"
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
