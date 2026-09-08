## 2025-03-10 - Mapbox/MapLibre performance with React
**Learning:** In a spatial analysis app heavily reliant on `react-map-gl`, inline arrays passed to map props like `interactiveLayerIds` cause the Map component to re-render constantly and re-bind event listeners (like `onClick`) on every render, severely degrading map interactivity and performance.
**Action:** Always refactor inline arrays or objects passed as props to `<Map>` components into top-level `useMemo` hooks with proper dependency arrays to preserve referential equality and avoid costly mapping engine re-renders.
