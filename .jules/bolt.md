## 2024-06-24 - Memoize React Map GL interactiveLayerIds
**Learning:** In react-map-gl (and maplibre), passing inline arrays to `interactiveLayerIds` causes the map to continuously re-evaluate event listeners for interactivity. This happens because the array reference changes on every render, which is a major performance bottleneck in heavily interactive spatial apps with many layers.
**Action:** Always wrap `interactiveLayerIds` (and similar array/object props passed to `Map`) in a `useMemo` hook to ensure referential equality across renders unless the underlying state actively changes.
