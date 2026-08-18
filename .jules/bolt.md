## 2024-05-18 - Extracted interactiveLayerIds to useMemo in Mapbox GL

**Learning:** Passing an inline array or calculation to `interactiveLayerIds` (or similar array props) on `react-map-gl`'s `<Map>` component forces the map to constantly unbind and rebind interaction events on every re-render (because the array reference changes). This is an easily missed performance hit in large map-based applications.

**Action:** Always extract complex inline arrays like `interactiveLayerIds` into a top-level `useMemo` hook, ensuring referential equality is preserved unless the underlying dependencies (like `activeLayers`) actually change.
