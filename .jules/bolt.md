## 2024-10-18 - Memoize Map Props
**Learning:** In react-map-gl, passing inline arrays to props like `interactiveLayerIds` causes the map component to re-render unnecessarily and re-bind event listeners, severely hurting performance, especially with many layers.
**Action:** Always wrap arrays/objects passed to Mapbox/MapLibre map components in `useMemo` to preserve referential equality and prevent costly map re-renders.
