## 2024-05-24 - MapLibre Performance
**Learning:** `interactiveLayerIds` passed as an inline array to `react-map-gl` causes the map to constantly re-render and re-bind event listeners, which ruins performance.
**Action:** Always memoize arrays and objects passed to Map components.
