## 2024-05-18 - Preserving Referential Equality for react-map-gl
**Learning:** Passing inline arrays or objects to `react-map-gl` components (like `Map` or `Source`) causes expensive MapLibre event re-bindings and deep comparisons on every render because referential equality is broken.
**Action:** Always wrap arrays (e.g. `interactiveLayerIds`) and objects (e.g. `data` in GeoJSON `Source`) in `useMemo` when passing them as props to map components.
