## 2024-07-27 - Memoize map interactive layer IDs
**Learning:** React Map GL `interactiveLayerIds` array causes significant performance degradation if defined inline, as array re-creation triggers Map re-renders and rebinds events on every parent render.
**Action:** Always wrap arrays of dynamic interactive layer IDs passed to `react-map-gl` in a `useMemo` hook to preserve referential equality and prevent costly map re-renders.
