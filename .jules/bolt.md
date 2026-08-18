## 2026-07-08 - Memoize Map interactiveLayerIds
**Learning:** React Map GL recreates the entire map state and triggers excessive re-renders if arrays like `interactiveLayerIds` are created inline in the render method, which is very common in complex mapping applications with dynamic layers.
**Action:** Always memoize arrays passed to React Map GL props using `useMemo` based on their actual dependencies to preserve referential equality and avoid 60fps re-renders during map interactions.
