## 2025-03-09 - Memoize interactiveLayerIds for map performance
**Learning:** Passing a dynamically generated array to the `interactiveLayerIds` prop of `react-map-gl` without memoization causes the Map component to receive a new array reference on every render, triggering expensive re-evaluation of map layers and potential unnecessary re-renders.
**Action:** Always memoize array and object props using `useMemo` when passing them into complex third-party components like MapLibre or Mapbox map instances to preserve referential equality and optimize performance.
