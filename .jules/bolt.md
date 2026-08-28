## 2024-06-03 - Inline Arrays in Map Properties
**Learning:** In React Map GL, passing a new array reference on every render to properties like `interactiveLayerIds` causes the underlying MapLibre instance to unnecessarily re-evaluate layer interactivity on every React render cycle.
**Action:** Always memoize derived array computations like `interactiveLayerIds` using `useMemo` when they depend on state arrays like `activeLayers`.
