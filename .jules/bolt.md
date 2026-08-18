## 2025-03-03 - Memoize inline map props to prevent re-binding
**Learning:** Inline array calculations like `activeLayers.map(...)` directly inside the `interactiveLayerIds` prop of a `react-map-gl` component break referential equality on every component render. This forces the map layer to unnecessarily re-evaluate or re-bind event listeners.
**Action:** Extract expensive or changing inline array calculations passed to map library components into a `useMemo` block to preserve referential equality when dependencies don't change.
