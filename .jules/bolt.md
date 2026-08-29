## 2024-05-30 - Map component rendering optimization
**Learning:** `interactiveLayerIds` array is re-created on every render causing the Map component (and the MapLibre instance underneath) to unbind and re-bind event listeners unnecessarily.
**Action:** Use `useMemo` for static configurations or arrays derived from state passed as props to map components, specifically `interactiveLayerIds` in `react-map-gl`, to preserve referential equality and avoid expensive re-renders and re-bindings.
