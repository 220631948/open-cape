## 2026-09-04 - Memoize interactiveLayerIds in react-map-gl
**Learning:** Passing inline arrays to `interactiveLayerIds` prop in `react-map-gl` destroys referential equality, forcing the map instance to constantly re-bind pointer events on every React render.
**Action:** Always memoize arrays or objects passed as props to `Map` components (especially `interactiveLayerIds`) with `useMemo`.
