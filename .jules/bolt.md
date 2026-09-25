
## 2024-05-18 - Memoize dynamic layer IDs in react-map-gl
**Learning:** In heavily dynamic mapping applications using `react-map-gl`, calculating complex nested arrays for `interactiveLayerIds` inline inside the render method will cause severe performance degradation due to React continuously destroying and recreating map event listeners on every state change.
**Action:** Always wrap `interactiveLayerIds` with `useMemo` when generating layer IDs dynamically from active state arrays.
