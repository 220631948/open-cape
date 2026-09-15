## 2024-10-24 - Memoize map layer array to prevent WebGL re-renders
**Learning:** In MapLibre/react-map-gl implementations, passing inline arrays to props like `interactiveLayerIds` triggers deep prop comparisons or full re-renders of the map component, which is exceptionally costly for WebGL canvases. The inline map and filter functions create new array references on every render.
**Action:** Always wrap arrays representing map layers or data sources passed to Map components in a `useMemo` hook to preserve referential equality and prevent sluggish map performance.
