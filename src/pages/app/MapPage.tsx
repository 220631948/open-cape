/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router";
import Map, {
  MapRef,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { LayerPanel } from "@/components/map/LayerPanel";
import { RightDetailDrawer } from "@/components/map/RightDetailDrawer";
import { ViewportStatusBar } from "@/components/map/ViewportStatusBar";
import { AddBookmarkDialog } from "@/components/map/AddBookmarkDialog";
import { SaveMapDialog } from "@/components/map/SaveMapDialog";
import { SourceManager } from "@/components/map/SourceManager";
import { ProjectPulseLayer } from "@/components/map/ProjectPulseLayer";
import { ALL_SOURCES } from "@/sources";
import { useProjects } from "@/hooks/useProjects";
import { ErfRecord, useErfSearch } from "@/hooks/useErfSearch";
import { AnimatePresence, motion } from "motion/react";
import { DrawControl } from "@/components/map/DrawControl";
import { DrawToolbar, DrawMode } from "@/components/map/DrawToolbar";
import { DrawingStyleEditor } from "@/components/map/DrawingStyleEditor";
import { AnnotationEditor } from "@/components/annotations/AnnotationEditor";
import { SpatialCommandBar } from "@/components/ai/SpatialCommandBar";
import { MarketChatPanel } from "@/components/ai/MarketChatPanel";
import { FilterPanel } from "@/components/map/FilterPanel";
import { SpatialQueryFilters } from "@/services/geminiService";
import { useDrawings, Drawing, DrawingStyle } from "@/hooks/useDrawings";
import { useAnnotations, Annotation } from "@/hooks/useAnnotations";
import { useSavedMaps } from "@/hooks/useSavedMaps";
import { getLiveErfRecord } from "@/source_connectors/cctOpenDataClient";
import { useProfile } from "@/contexts/useProfile";
import { useLayerPreferences } from "@/contexts/useLayerPreferences";
import { useEnvironmentalContext } from "@/contexts/EnvironmentalContext";
import { FeaturePopup } from "@/components/map/FeaturePopup";
import { useOSINTVerification } from "@/hooks/useOSINTVerification";
import { useImportedGeoJsonLayers } from "@/hooks/useImportedGeoJsonLayers";
import { OsintDrawer } from "@/components/map/OsintDrawer";
import { OsintVerificationModal } from "@/components/map/OsintVerificationModal";
import { SearchBar } from "@/components/map/SearchBar";
import { useBookmarks } from "@/hooks/useBookmarks";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { X, Layers, Filter } from "lucide-react";
import * as turf from "@turf/turf";
import { cn } from "@/lib/utils";
import { ActiveVectorLayer } from "@/components/map/ActiveVectorLayer";
import { VECTOR_LAYERS } from "@/hooks/useVectorLayer";
import { AnnotationCard } from "@/components/annotations/AnnotationCard";
import { queryNearbyFeatures, getBufferPolygon, SpatialQueryResult } from "@/services/spatialAnalysisBus";
import { RadiusResultsPanel } from "@/components/map/RadiusResultsPanel";

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

  const drawingAnnotationMarkers = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: drawings
        .filter((d) => d.imageUrl)
        .map((d) => {
          let center;
          try {
            const geom = typeof d.geometry === 'string' ? JSON.parse(d.geometry) : d.geometry;
            center = turf.centroid(geom as any);
          } catch (e) {
            console.error('Failed to calculate centroid for drawing', d.id, e);
            return null;
          }
          
          if (!center) return null;

          return {
            ...center,
            properties: {
              id: d.id,
              imageUrl: d.imageUrl,
              title: d.title,
            },
          };
        })
        .filter(Boolean),
    };
  }, [drawings]);
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
    projectId: string | null;
    imageUrl: string | null;
  } | null>(null);

  const [editingNote, setEditingNote] = useState<Annotation | null>(null);

  const [isFetchingFeature, setIsFetchingFeature] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [oamHealth, setOamHealth] = useState<'healthy'|'degraded'|'offline'>('healthy');
  const [oamErrorMsg, setOamErrorMsg] = useState<string | null>(null);
  const [customSources, setCustomSources] = useState<any[]>([]);

  // Radius Analysis state
  const [radiusResults, setRadiusResults] = useState<SpatialQueryResult[]>([]);
  const [analysisRadius, setAnalysisRadius] = useState(500);
  const [analysisCenter, setAnalysisCenter] = useState<[number, number] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [radiusBuffer, setRadiusBuffer] = useState<any>(null);

  useEffect(() => {
    const handleAddCustomSource = (e: any) => {
      const source = e.detail;
      setCustomSources(prev => {
        // Prevent duplicates
        if (prev.find(s => s.id === source.id)) return prev;
        return [...prev, source];
      });
      
      // also ensure it's "active" if it's not already
      if (source.id) {
         setActiveLayers(prev => prev.includes(source.id) ? prev : [...prev, source.id]);
      }
    };
    
    window.addEventListener('map:add-custom-source', handleAddCustomSource);
    return () => window.removeEventListener('map:add-custom-source', handleAddCustomSource);
  }, []);

  useEffect(() => {
    const handleCenterOnFeature = (e: any) => {
      const { geometry, parcelId } = e.detail;
      const map = mapRef.current?.getMap();
      if (!map) return;

      if (geometry) {
        try {
          const bounds = turf.bbox(geometry as any);
          map.fitBounds([bounds[0], bounds[1], bounds[2], bounds[3]], { 
            padding: 100, 
            duration: 1500,
            maxZoom: 18
          });
        } catch (err) {
          console.error('Failed to fit bounds to geometry:', err);
        }
      } else if (parcelId) {
        // If we don't have geometry but have an ID, we might need to fetch it or rely on the fact that it's already selected
        // For now, if geometry is null, we can at least try to find the selected erf if id matches
        if (selectedErf && String(selectedErf.id) === String(parcelId)) {
          const center = selectedErf.center;
          if (center) {
             map.flyTo({ center: [center.lng, center.lat], zoom: 17, duration: 1500 });
          }
        }
      }
    };

    window.addEventListener('map:center-on-feature', handleCenterOnFeature);
    return () => window.removeEventListener('map:center-on-feature', handleCenterOnFeature);
  }, [selectedErf]);
  const [showPriceHeatmap, setShowPriceHeatmap] = useState(false);
  const [showProjectPulse, setShowProjectPulse] = useState(true);
  const [showMarketChat, setShowMarketChat] = useState(false);

  const { activeLayers: eeActiveLayers } = useEnvironmentalContext();

  const [activeLayers, setActiveLayers] = useState<string[]>(['wcgp-cadastre-vector']);
  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({});
  const [baseMap, setBaseMap] = useState<"street" | "satellite" | "topo">("street");
  const [showHillshade, setShowHillshade] = useState(false);
  const [historicalYear, setHistoricalYear] = useState<number | null>(null);
  const { updatePreferences } = useLayerPreferences();

  const [layerPanelOpen, setLayerPanelOpen] = useState(false);

  // Keep MapboxDraw features on top of dynamic rasters/layers
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    
    const enforceLayerOrder = () => {
      try {
        const style = map.getStyle();
        if (!style) return;
        
        // Find all draw layers and move them to top
        const drawLayers = style.layers.filter(l => l.id.startsWith('gl-draw-') || l.id === "guide");
        drawLayers.forEach(layer => {
          if (map.getLayer(layer.id)) map.moveLayer(layer.id);
        });
      } catch {
        // map might be unmounted
      }
    };

    map.on('styledata', enforceLayerOrder);
    map.on('idle', enforceLayerOrder);
    
    // Initial run
    const tid = setTimeout(enforceLayerOrder, 250);
    
    return () => {
      clearTimeout(tid);
      map.off('styledata', enforceLayerOrder);
      map.off('idle', enforceLayerOrder);
    };
  }, [baseMap, activeLayers, layerOpacities, historicalYear]);
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
      return next;
    });
  };

  useEffect(() => {
    if (layerPrefs && initialLockRef.current) {
      updatePreferences({ defaultViews: activeLayers });
    }
  }, [activeLayers, layerPrefs, updatePreferences]);

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayerOpacities(prev => ({ ...prev, [layerId]: opacity }));
  };

  useEffect(() => {
    if (layerPrefs && initialLockRef.current) {
       updatePreferences({ opacities: layerOpacities });
    }
  }, [layerOpacities, layerPrefs, updatePreferences]);

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
      queryErfNumber?: string;
    };

    if (state?.showBuffer) {
      setShowBuffer(true);
    }

    if (state?.queryErfNumber) {
      // Find the ERF by erfNumber
      const fetchErfByNumber = async () => {
        try {
          const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const q = query(
            collection(db, 'erfs'), 
            where('erfNumber', '==', state.queryErfNumber),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data() as ErfRecord;
            setSelectedErf(data);
            if (data.center) {
              mapRef.current?.flyTo({
                center: [data.center.lng, data.center.lat],
                zoom: 17,
                duration: 1500,
                essential: true,
              });
            }
            setDrawerOpen(true);
          }
        } catch (e) {
          console.error("Failed to query ERF by number:", e);
        }
      };
      fetchErfByNumber();
    } else if (state?.savedMapId && savedMaps.length > 0) {
      const sm = savedMaps.find((m) => m.id === state.savedMapId);
      if (sm) {
        setViewState({
          longitude: sm.viewport.longitude,
          latitude: sm.viewport.latitude,
          zoom: sm.viewport.zoom,
          pitch: sm.viewport.pitch || 0,
          bearing: sm.viewport.bearing || 0,
        });
        if (sm.visibleLayers && sm.visibleLayers.length > 0) {
          setActiveLayers(sm.visibleLayers);
        }
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
              properties: { 
                user_stroke: d.style?.stroke,
                user_strokeWidth: d.style?.strokeWidth,
                user_fill: d.style?.fill,
                user_fillOpacity: d.style?.fillOpacity,
                user_title: d.title 
              },
              geometry: d.geometry,
            });
          } else {
            // Update existing feature properties
            draw.setFeatureProperty(d.id, "user_title", d.title);
            if (d.style) {
              Object.entries(d.style).forEach(([k, v]) => {
                draw.setFeatureProperty(d.id, `user_${k}`, v);
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
      case "square":
        drawRef.current.changeMode("draw_rectangle");
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
      properties: { 
        user_stroke: DEFAULT_STYLE.stroke,
        user_strokeWidth: DEFAULT_STYLE.strokeWidth,
        user_fill: DEFAULT_STYLE.fill,
        user_fillOpacity: DEFAULT_STYLE.fillOpacity,
        user_title: "New Drawing" 
      },
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
        setEditingDrawing({ 
          title: d.title, 
          style: d.style, 
          projectId: d.projectId || null,
          imageUrl: d.imageUrl || null
        });
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
        projectId: editingDrawing.projectId,
        imageUrl: editingDrawing.imageUrl,
      });
      // Update properties in MapboxDraw for immediate visual feedback
      drawRef.current?.setFeatureProperty(
        selectedDrawingId,
        "user_title",
        editingDrawing.title,
      );
      Object.entries(editingDrawing.style).forEach(([k, v]) => {
        drawRef.current?.setFeatureProperty(selectedDrawingId, `user_${k}`, v);
      });
      setShowStyleEditor(false);
    }
  };

  const handleSaveAnnotation = async (data: any) => {
    if (selectedDrawingId || selectedErf) {
      if (editingNote) {
        await updateAnnotation(editingNote.id, data);
      } else {
        const targetType = selectedDrawingId ? "drawing" : "parcel";
        const targetId = selectedDrawingId || selectedErf?.id || "";
        const geometry = selectedDrawingId 
          ? drawRef.current?.get(selectedDrawingId)?.geometry 
          : selectedErf?.geometry;

        await createAnnotation({
          ...data,
          targetType,
          targetId,
          geometry: geometry || null
        });
      }
      setShowAnnotationEditor(false);
      setEditingNote(null);
    }
  };

  const drawingAnnotations = annotations.filter(a => a.targetId === selectedDrawingId && a.targetType === 'drawing');

  const handleSearchResultSelect = async (result: any) => {
    try {
      if (result.type === 'erf') {
        const erf = result.data;
        setIsFetchingFeature(true);
        // Fetch full details
        let targetErf = await fetchErfDetails(erf.id);
        
        // If fetch fails (e.g. it's a geocoded address without a DB record), use the basic record
        if (!targetErf) {
           targetErf = erf;
        }
        
        if (targetErf) {
          setSelectedErf(targetErf);
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [targetErf.center.lng, targetErf.center.lat],
              zoom: 18,
              duration: 1000
            });
          }
          setDrawerOpen(true);
        }
      } else if (result.type === 'drawing') {
        const drawing = result.data;
        let center: [number, number] = [18.4241, -33.9249];
        const geom = typeof drawing.geometry === 'string' ? JSON.parse(drawing.geometry) : drawing.geometry;
        
        if (drawing.geometryType === "Point") {
          center = geom.coordinates;
        } else {
          const centroid = turf.centroid(geom as any);
          center = centroid.geometry.coordinates as [number, number];
        }

        if (mapRef.current) {
          mapRef.current.flyTo({
            center,
            zoom: 17,
            duration: 1500,
            essential: true,
          });
        }
        
        // Ensure layer is visible
        if (!activeLayers.includes('user_drawings')) {
          setActiveLayers(prev => [...prev, 'user_drawings']);
        }
        
        // Select the drawing
        setSelectedDrawingId(drawing.id);
        setEditingDrawing({
          title: drawing.title,
          style: drawing.style,
          projectId: drawing.projectId || null,
          imageUrl: drawing.imageUrl || null
        });
        setShowStyleEditor(true);
      } else if (result.type === 'annotation') {
        const annotation = result.data;
        // Search results for annotations should probably zoom to the target
        if (annotation.targetType === 'drawing') {
           const targetDrawing = drawings.find(d => d.id === annotation.targetId);
           if (targetDrawing) {
             handleSearchResultSelect({ type: 'drawing', data: targetDrawing });
             setEditingNote(annotation);
             setShowAnnotationEditor(true);
           }
        }
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

  const { createBookmark } = useBookmarks();

  const handleBookmarkFeature = async () => {
    if (!popupInfo) return;
    try {
      await createBookmark({
        label: popupInfo.feature.properties?.label || popupInfo.feature.properties?.NAME || `Feature in ${popupInfo.layerId}`,
        type: 'feature',
        projectId: null,
        featureRef: popupInfo.feature,
        sourceRefs: [popupInfo.layerId],
        notes: `Bookmarked from map view: ${popupInfo.layerId}`
      });
      window.alert("Feature bookmarked successfully.");
    } catch (e) {
      window.alert("Failed to bookmark feature.");
    }
  };

  const handleAddParcelAnnotation = async (data: any) => {
    if (selectedErf) {
      await createAnnotation({
        ...data,
        targetType: "map",
        targetId: selectedErf.id,
        projectId: data.projectId || undefined
      });
      setShowAnnotationEditor(false);
      setEditingNote(null);
      window.alert("Private annotation added to parcel.");
    }
  };

  // ⚡ Bolt: Memoize interactiveLayerIds to preserve referential equality and prevent costly react-map-gl re-evaluations on every frame
  const interactiveLayerIds = useMemo(() => [
    ...activeLayers.map(id => `layer-${id}`),
    ...activeLayers.map(id => `layer-${id}-fill`),
    ...activeLayers.map(id => `layer-${id}-line`),
    ...activeLayers.map(id => `layer-${id}-circle`),
    ...activeLayers.map(id => `layer-${id}-clusters`),
    ...activeLayers.map(id => `layer-${id}-cluster-count`),
    ...ALL_SOURCES.filter(s => activeLayers.includes(s.id))
      .flatMap(s => s.mapLibreLayers.map(l => l.id)),
    "drawing-annotation-images"
  ], [activeLayers]);

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
                showProjectPulse={showProjectPulse}
                setShowProjectPulse={setShowProjectPulse}
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
              interactiveLayerIds={interactiveLayerIds}
              onClick={async (evt) => {
                if (drawMode === "radius") {
                  const { lng, lat } = evt.lngLat;
                  setAnalysisCenter([lng, lat]);
                  setIsAnalyzing(true);
                  
                  // Generate buffer for visual
                  const buffer = getBufferPolygon([lng, lat], analysisRadius);
                  setRadiusBuffer(buffer);

                  // Perform query after short delay to simulate "thinking" and allow state to settle
                  setTimeout(() => {
                    const map = mapRef.current?.getMap();
                    if (map) {
                      const features = map.queryRenderedFeatures();
                      const results = queryNearbyFeatures([lng, lat], analysisRadius, features);
                      setRadiusResults(results);
                    }
                    setIsAnalyzing(false);
                  }, 800);
                  
                  // Keep select mode active so toolbar highlights it, or stay in radius?
                  // Usually user might want to click multiple times.
                  return;
                }

                if (drawMode !== "select") return;

                // Handle clicks on interactive vector layers
                let clickedMapFeature: any = null;
                if (evt.features && evt.features.length > 0) {
                  const feature = evt.features[0];

                  // Handle drawing annotation image clicks
                  if (feature.layer.id === 'drawing-annotation-images') {
                    setPopupInfo({
                      lngLat: [evt.lngLat.lng, evt.lngLat.lat],
                      feature: feature,
                      layerId: 'drawing-annotation'
                    });
                    return;
                  }

                  // If it's a cadastre or zoning layer, fetch granular parcel data via RightDetailDrawer logic
                  const layerId = feature.layer.id;
                  const isParcelLayer = [
                    'wcgp-cadastre',
                    'wcgp-cadastre-vector',
                    'wcgp-zoning-vector',
                    'erf_boundaries',
                    'general_plans',
                    'zoning_dms'
                  ].some(id => layerId.includes(id));

                  if (isParcelLayer) {
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
                  // Attempt to fetch live data from CCT API, fallback to map feature attributes if offline/unavailable
                  const liveFeature = await getLiveErfRecord(lng, lat, clickedMapFeature);
                  if (liveFeature) {
                    setSelectedErf(liveFeature);
                    setDrawerOpen(true);
                  } else {
                    // Final fallback if even the mapper fails to return anything
                    let address = null;
                    let allotmentArea = "Not available from source";
                    try {
                       const { reverseGeocode } = await import('@/services/geocodingService');
                       const geocodeResult = await reverseGeocode(lat, lng);
                       if (geocodeResult) {
                         address = geocodeResult.formattedAddress || geocodeResult.address || null;
                         allotmentArea = "Location Identified";
                       }
                    } catch (e) {
                      console.warn("Reverse geocode failed on map click", e);
                    }
                    
                    setSelectedErf({
                      id: `loc-${lat.toFixed(4)}-${lng.toFixed(4)}`,
                      objectId: 0,
                      erfNumber: address ? "Address Match" : "Not available from source",
                      allotmentArea: allotmentArea,
                      address: address,
                      center: { lat, lng },
                      status: address ? "geocode" : "offline",
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
                  console.error("Error handling map click selection:", e);
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
           sources={[...ALL_SOURCES, ...customSources]} 
           activeLayerIds={[...activeLayers, ...eeActiveLayers]} 
           layerOpacities={layerOpacities}
        />

        {/* Dynamic Custom Sources (e.g. from URL) */}
        {customSources.filter(s => s.type === 'geojson').map(source => (
          <Source key={source.id} id={source.id} type="geojson" data={source.url}>
             {activeLayers.includes(source.id) && (
               <>
                 <Layer 
                   id={`${source.id}-fill`} 
                   type="fill" 
                   filter={["==", "$type", "Polygon"]}
                   paint={{ "fill-color": "#4f46e5", "fill-opacity": 0.3 * (layerOpacities[source.id] ?? 1) }} 
                 />
                 <Layer 
                   id={`${source.id}-line`} 
                   type="line" 
                   filter={["any", ["==", "$type", "Polygon"], ["==", "$type", "LineString"]]}
                   paint={{ "line-color": "#4f46e5", "line-width": 2, "line-opacity": (layerOpacities[source.id] ?? 1) }} 
                 />
                 <Layer 
                   id={`${source.id}-circle`} 
                   type="circle" 
                   filter={["==", "$type", "Point"]}
                   paint={{ "circle-radius": 5, "circle-color": "#4f46e5", "circle-opacity": (layerOpacities[source.id] ?? 1) }} 
                 />
               </>
             )}
          </Source>
        ))}

        <ProjectPulseLayer visible={showProjectPulse} />
        
        {/* Dynamic Property Price Heatmap Layer */}
        {showPriceHeatmap && (
          <Source id="price-heatmap-source" type="vector" tiles={['/api/tiles/properties/{z}/{x}/{y}.pbf']} maxzoom={14}>
             <Layer 
               id="price-heatmap-layer"
               type="heatmap"
               source-layer="properties"
               paint={{
                 'heatmap-weight': [
                   'interpolate',
                   ['linear'],
                   ['get', 'valuation'],
                   0, 0,
                   // Cap at 10 million for weight scale
                   10000000, 1
                 ],
                 'heatmap-intensity': [
                   'interpolate',
                   ['linear'],
                   ['zoom'],
                   0, 1,
                   15, 3
                 ],
                 'heatmap-color': [
                   'interpolate',
                   ['linear'],
                   ['heatmap-density'],
                   0, 'rgba(33,102,172,0)',
                   0.2, 'rgb(103,169,207)',
                   0.4, 'rgb(209,229,240)',
                   0.6, 'rgb(253,219,199)',
                   0.8, 'rgb(239,138,98)',
                   1, 'rgb(178,24,43)'
                 ],
                 'heatmap-radius': [
                   'interpolate',
                   ['linear'],
                   ['zoom'],
                   0, 4,
                   15, 25
                 ],
                 'heatmap-opacity': 0.8
               } as any}
             />
             <Layer
                id="price-point-layer"
                type="circle"
                source-layer="properties"
                minzoom={14}
                paint={{
                  'circle-radius': 5,
                  'circle-color': [
                    'step',
                    ['get', 'valuation'],
                    '#3b82f6', // blue for low
                    2000000, '#10b981', // green 
                    5000000, '#f59e0b', // orange
                    10000000, '#ef4444' // red for high
                  ],
                  'circle-stroke-width': 1,
                  'circle-stroke-color': '#fff'
                } as any}
             />
          </Source>
        )}
        
              {radiusBuffer && (
                <Source id="radius-buffer" type="geojson" data={radiusBuffer}>
                  <Layer
                    id="radius-buffer-fill"
                    type="fill"
                    paint={{
                      "fill-color": "#6366f1", // indigo-500
                      "fill-opacity": 0.1,
                    }}
                  />
                  <Layer
                    id="radius-buffer-line"
                    type="line"
                    paint={{
                      "line-color": "#6366f1",
                      "line-width": 2,
                      "line-dasharray": [4, 4],
                    }}
                  />
                </Source>
              )}

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

                // Build paint expressions based on styleRules
                // Expected styleRules: array of { property, operator, value, color }
                let fillColor: any = "#4f46e5";
                let lineColor: any = "#4338ca";
                let circleColor: any = "#4f46e5";

                if (layer.styleRules && layer.styleRules.length > 0) {
                   const caseExpr: any[] = ["case"];
                   layer.styleRules.forEach((rule: any) => {
                     // Support various simple operators
                     if (rule.operator === '==') {
                       caseExpr.push(["==", ["get", rule.property], rule.value], rule.color);
                     } else if (rule.operator === '!=') {
                       caseExpr.push(["!=", ["get", rule.property], rule.value], rule.color);
                     } else if (rule.operator === '>') {
                       caseExpr.push([">", ["get", rule.property], Number(rule.value)], rule.color);
                     } else if (rule.operator === '<') {
                       caseExpr.push(["<", ["get", rule.property], Number(rule.value)], rule.color);
                     } else {
                       // default to match
                       caseExpr.push(["==", ["get", rule.property], rule.value], rule.color);
                     }
                   });
                   caseExpr.push("#4f46e5"); // fallback
                   fillColor = caseExpr;
                   lineColor = caseExpr;
                   circleColor = caseExpr;
                }

                return (
                  <Source
                    key={`imported-${layer.id}`}
                    id={`imported-src-${layer.id}`}
                    type="geojson"
                    data={data as any}
                  >
                    <Layer
                      id={`imported-fill-${layer.id}`}
                      type="fill"
                      filter={["==", "$type", "Polygon"]}
                      paint={{
                        "fill-color": fillColor,
                        "fill-opacity": 0.3,
                      }}
                    />
                    <Layer
                      id={`imported-line-${layer.id}`}
                      type="line"
                      filter={["any", ["==", "$type", "Polygon"], ["==", "$type", "LineString"]]}
                      paint={{
                        "line-color": lineColor,
                        "line-width": 2,
                      }}
                    />
                    <Layer
                      id={`imported-circle-${layer.id}`}
                      type="circle"
                      filter={["==", "$type", "Point"]}
                      paint={{
                        "circle-radius": 5,
                        "circle-color": circleColor,
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff"
                      }}
                    />
                  </Source>
                );
              })}

              <Source id="map-annotations" type="geojson" data={{
                type: 'FeatureCollection',
                features: annotations.filter(a => a.geometry).map(a => ({
                   type: 'Feature',
                   id: a.id,
                   geometry: a.geometry,
                   properties: {
                     ...a.style,
                     title: a.title,
                     id: a.id
                   }
                }))
              } as any}>
                 <Layer
                   id="annotation-fill"
                   type="fill"
                   filter={["==", "$type", "Polygon"]}
                   paint={{
                      "fill-color": ["coalesce", ["get", "fill"], "#e11d48"],
                      "fill-opacity": ["coalesce", ["get", "fillOpacity"], 0.1]
                   } as any}
                 />
                 <Layer
                   id="annotation-line"
                   type="line"
                   filter={["any", ["==", "$type", "Polygon"], ["==", "$type", "LineString"]]}
                   paint={{
                      "line-color": ["coalesce", ["get", "stroke"], "#e11d48"],
                      "line-width": ["coalesce", ["get", "strokeWidth"], 2]
                   } as any}
                 />
                 <Layer
                   id="annotation-label"
                   type="symbol"
                   layout={{
                      "text-field": ["get", "title"],
                      "text-size": 12,
                      "text-anchor": "center",
                      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"]
                   } as any}
                   paint={{
                      "text-color": ["coalesce", ["get", "stroke"], "#000"],
                      "text-halo-color": "#ffffff",
                      "text-halo-width": 1
                   }}
                 />
              </Source>

              <Source id="drawing-annotations" type="geojson" data={drawingAnnotationMarkers as any}>
                <Layer
                  id="drawing-annotation-images"
                  type="symbol"
                  layout={{
                    "icon-image": "camera-15", // standard maplibre-gl icon if using a style that has it
                    "icon-size": 1,
                    "icon-allow-overlap": true,
                  }}
                  paint={{
                    "icon-color": "#4f46e5",
                    "icon-halo-color": "#ffffff",
                    "icon-halo-width": 1,
                  }}
                />
              </Source>

              {popupInfo && (
                <FeaturePopup
                  popupInfo={popupInfo}
                  onClose={() => setPopupInfo(null)}
                  onBookmark={() => setBookmarkDialogOpen(true)}
                  onVerify={() => {
                    setOsintPending({layerId: popupInfo.layerId, feature: popupInfo.feature});
                    setPopupInfo(null);
                  }}
                />
              )}
            </Map>
            
            <OsintVerificationModal
              isOpen={!!osintPending}
              onClose={() => setOsintPending(null)}
              featureInfo={osintPending}
              onVerifyComplete={() => {
                 setOsintPending(null);
                 setOsintDrawerInfo(null);
              }}
            />

            {/* Mobile-Friendly Stackable Top UI Overlay */}
            <div className="absolute top-4 inset-x-4 z-30 pointer-events-none">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative">
                
                {/* Top Bar: Left (Toggle) + Right (Mobile Tools) */}
                <div className="flex justify-between items-start w-full md:w-auto md:flex-none">
                  <div className="pointer-events-auto shrink-0 z-10">
                    <button
                      className="bg-white/95 backdrop-blur-md text-surface-700 hover:text-rose-600 border border-surface-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-12 w-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      onClick={() => setLayerPanelOpen(open => !open)}
                      title="Toggle Layers Panel"
                    >
                      <Layers className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Right Tools (hidden on md) */}
                  <div className="pointer-events-none flex md:hidden flex-col gap-2.5 items-end z-10 relative">
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
                      className={cn("bg-white text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all pointer-events-auto",
                        showPriceHeatmap ? 'border border-amber-500 text-amber-700 bg-amber-50 shadow-amber-500/20' : 'border border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                      )}
                    >
                      Price Heatmap
                    </button>
                    <button 
                      onClick={() => setShowMarketChat(!showMarketChat)}
                      className={cn("bg-white text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all pointer-events-auto flex items-center gap-1.5",
                        showMarketChat ? 'border border-indigo-500 text-indigo-700 bg-indigo-50 shadow-indigo-500/20' : 'border border-surface-200 hover:bg-surface-50 text-indigo-600 hover:text-indigo-800'
                      )}
                    >
                      AI Market Chat
                    </button>
                  </div>
                </div>

                {/* Center Column: Search & AI Command (Absolute on md, stacked on mobile) */}
                <div className="pointer-events-none flex flex-col gap-3 w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:max-w-2xl px-0 z-0 mt-2 md:mt-0">
                  <div className="flex items-center gap-3 w-full pointer-events-auto">
                    <div className="flex-1">
                      <SearchBar onSelect={handleSearchResultSelect} />
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

                {/* Desktop Right Tools (hidden on sm, visible on md) */}
                <div className="pointer-events-none hidden md:flex flex-col gap-2.5 items-end z-10 absolute right-0 top-0">
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
                    className={cn("bg-white text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all pointer-events-auto",
                      showPriceHeatmap ? 'border border-amber-500 text-amber-700 bg-amber-50 shadow-amber-500/20' : 'border border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    )}
                  >
                    Price Heatmap
                  </button>
                  <button 
                    onClick={() => setShowMarketChat(!showMarketChat)}
                    className={cn("bg-white text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all pointer-events-auto flex items-center gap-1.5",
                      showMarketChat ? 'border border-indigo-500 text-indigo-700 bg-indigo-50 shadow-indigo-500/20' : 'border border-surface-200 hover:bg-surface-50 text-indigo-600 hover:text-indigo-800'
                    )}
                  >
                    AI Market Chat
                  </button>
                </div>
              </div>
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
                  getVisibleFeatures={() => {
                    const map = mapRef.current?.getMap();
                    if (!map) return [];
                    const features = map.queryRenderedFeatures();
                    // Filter out basemap features and only keep our custom layers if possible
                    // Or just pick those with properties and no mapbox/maptiler internal fields
                    return features.map(f => f.properties || {}).filter(p => Object.keys(p).length > 2);
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
                      projectId={editingDrawing.projectId}
                      imageUrl={editingDrawing.imageUrl}
                      onTitleChange={(t) =>
                        setEditingDrawing({ ...editingDrawing, title: t })
                      }
                      onStyleChange={(s) =>
                        setEditingDrawing({ ...editingDrawing, style: s })
                      }
                      onProjectChange={(pid) => 
                        setEditingDrawing({ ...editingDrawing, projectId: pid })
                      }
                      onImageUrlChange={(url) =>
                        setEditingDrawing({ ...editingDrawing, imageUrl: url })
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
                      initialImageUrl={editingNote?.imageUrl}
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

      {analysisCenter && radiusBuffer && (
        <RadiusResultsPanel 
          radius={analysisRadius}
          center={analysisCenter}
          results={radiusResults}
          isLoading={isAnalyzing}
          onRadiusChange={(newRadius) => {
            setAnalysisRadius(newRadius);
            const buffer = getBufferPolygon(analysisCenter, newRadius);
            setRadiusBuffer(buffer);
            setIsAnalyzing(true);
            setTimeout(() => {
              const map = mapRef.current?.getMap();
              if (map) {
                 const features = map.queryRenderedFeatures();
                 const results = queryNearbyFeatures(analysisCenter, newRadius, features);
                 setRadiusResults(results);
              }
              setIsAnalyzing(false);
            }, 600);
          }}
          onClose={() => {
            setRadiusBuffer(null);
            setRadiusResults([]);
            setAnalysisCenter(null);
          }}
        />
      )}

      {/* Bottom Status Bar */}
      <ViewportStatusBar
        zoom={viewState.zoom}
        lat={viewState.latitude}
        lng={viewState.longitude}
      />
    </div>
  );
};
