## 2024-03-20 - MapComponent Referential Equality
**Learning:** The Map component in `react-map-gl` takes heavy arrays and functions, such as `interactiveLayerIds`. Passing inline arrays created on the fly directly to props causes severe performance issues by triggering full re-renders of the WebGL map instance.
**Action:** Always memoize inline props like arrays (e.g. `interactiveLayerIds`) using `useMemo` and functions (e.g. `onClick`) using `useCallback` when passing them to the Map component.
