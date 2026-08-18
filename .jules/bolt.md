## 2024-05-24 - Memoizing map arrays

**Learning:** react-map-gl is highly sensitive to prop referential equality. Passing inline computed arrays (like mapping over active layers to dynamically generate `interactiveLayerIds`) causes expensive map re-renders and re-bindings on every single component render, leading to significant input lag and jitter on heavily loaded map pages.
**Action:** Always extract inline array or object allocations for map configuration props (like `interactiveLayerIds`) into `useMemo` hooks that only recompute when their base dependencies (e.g., `activeLayers`) change.
