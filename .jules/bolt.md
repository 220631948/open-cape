## 2025-03-01 - Optimizing React-Map-GL Renders
**Learning:** React-Map-GL (and Mapbox/MapLibre wrappers) are highly sensitive to referential equality in their props. Passing inline arrays (e.g., mapping state repeatedly for `interactiveLayerIds`) or large inline functions (e.g., `onClick`) forces the map to constantly re-bind events and process layers during standard React component re-renders.
**Action:** Always memoize arrays passed as props using `useMemo` and event handlers using `useCallback` when working with heavy third-party mapping libraries to avoid cascading performance hits.
