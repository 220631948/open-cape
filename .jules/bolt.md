## 2024-05-24 - Inline functions causing react-map-gl rerenders
**Learning:** Passing inline arrays or functions directly into `<Map>` props (like `interactiveLayerIds`, `onClick`, `onData`, `onLoad`, `onError`) causes costly rerenders for map components on every render cycle, severely impacting performance for platforms heavily reliant on MapLibre.
**Action:** Always memoize these values using `useMemo` for inline arrays/objects and `useCallback` for inline functions to preserve referential equality and avoid unnecessary rendering loops.
