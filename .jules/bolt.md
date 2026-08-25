## 2024-08-25 - Prevent Map Event Re-binding

**Learning:** Passing inline arrays (e.g. mapping over arrays to generate IDs) directly to the `interactiveLayerIds` prop on the `react-map-gl` `Map` component breaks referential equality on every render. This forces the map to constantly unbind and rebind all interactive events for those layers, which causes significant performance overhead and lag, especially when moving or interacting with a complex map.
**Action:** Always memoize derived arrays passed to `Map` component props (like `interactiveLayerIds` or source definitions) using `useMemo` at the top level of the component to preserve referential equality across renders.
