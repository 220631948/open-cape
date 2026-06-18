## 2024-05-18 - Map component referential equality
**Learning:** React wrapper libraries for map tools like `react-map-gl` perform expensive prop diffing and data re-parsing when prop references change. Un-memoized inline arrays (like `interactiveLayerIds`) and objects (like GeoJSON `data`) cause these expensive operations on every render frame during map interaction.
**Action:** Always memoize complex data structures (arrays, objects) passed to Mapbox/MapLibre map components and sources using `useMemo` to preserve referential equality and avoid degraded interaction performance.
