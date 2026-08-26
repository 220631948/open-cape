## 2025-03-09 - Memoize interactiveLayerIds for react-map-gl
**Learning:** In react-map-gl, passing inline arrays to props like `interactiveLayerIds` causes the Map component to re-render constantly and re-bind event handlers on every render cycle, severely impacting map performance, especially when dragging or panning.
**Action:** Always wrap dynamically generated arrays passed to map components (like `interactiveLayerIds`) in `useMemo` to preserve referential equality across renders.
