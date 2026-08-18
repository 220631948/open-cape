## 2024-05-24 - Preserving referential equality on map arrays
**Learning:** In heavily used map components (like react-map-gl/maplibre), inline array declarations for props like `interactiveLayerIds` (`[...activeLayers.map(...)]`) break referential equality and force expensive re-renders or internal state resets on every render pass.
**Action:** Always wrap derived map layer arrays and property objects in `useMemo`, and map event handlers in `useCallback` to preserve referential equality and optimize rendering loops.
