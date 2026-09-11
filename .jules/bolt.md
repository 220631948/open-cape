## 2024-05-15 - react-map-gl interactiveLayerIds referential equality
**Learning:** Passing inline arrays or objects to map wrapper components like `react-map-gl` props (such as `interactiveLayerIds`) forces the map instance to unnecessarily re-evaluate interactivity arrays, check layer bounds, and re-bind native map events on every React render.
**Action:** Always extract static or conditionally derived arrays/objects passed to map props into top-level `useMemo` hooks, specifying correct dependencies to preserve referential equality and optimize map performance.
