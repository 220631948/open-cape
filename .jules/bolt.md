## 2024-05-24 - React-Map-GL Memoization Optimization
**Learning:** `interactiveLayerIds` passed as an inline array to `<Map />` from `react-map-gl` causes the map to continuously re-evaluate interactive layers and event bindings upon every single React render, creating a significant performance bottleneck, especially on maps with many active sources.
**Action:** Always memoize complex array and object props (like `interactiveLayerIds` or inline sources) passed to `<Map />` using `useMemo` with minimal dependencies (e.g., `activeLayers`) to preserve referential equality across renders.
