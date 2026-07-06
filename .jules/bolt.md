## 2026-07-06 - Memoizing Map Props
**Learning:** In map-heavy React applications using `react-map-gl`, passing a new array reference (e.g., inline `[...] `) to props like `interactiveLayerIds` on every render triggers internal re-evaluations and costly reconciliations within the Map component, which can lead to significant main thread blocking when interacting with the map.
**Action:** Always wrap arrays and objects passed to `react-map-gl` props in `useMemo` and functions in `useCallback` to preserve referential equality.
