## 2024-05-15 - Referential Equality for react-map-gl interactiveLayerIds
**Learning:** In react-map-gl (and maplibre), passing inline arrays to `interactiveLayerIds` breaks referential equality on every render, causing the map component to unnecessarily re-evaluate interactivity and potentially re-render, leading to performance bottlenecks, especially when the layer array is large.
**Action:** Always memoize arrays or objects passed as props to map components (like `interactiveLayerIds`) using `useMemo` at the top level of the component.
