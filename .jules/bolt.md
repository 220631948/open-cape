## 2024-05-24 - React-map-gl Referential Equality
**Learning:** `MapPage.tsx` passed `interactiveLayerIds` as a newly instantiated inline array on every render, causing the underlying `react-map-gl` wrapper to aggressively re-evaluate interactive elements during standard pan/zoom operations because `viewState` triggers 60FPS re-renders.
**Action:** Extract inline arrays to `useMemo` and inline functions to `useCallback` when passed to complex map components to dramatically stabilize React render pipelines during high-frequency events.
