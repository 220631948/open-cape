## 2024-08-19 - Avoid Inline Arrays for interactiveLayerIds in React Map GL
**Learning:** Passing an inline array for `interactiveLayerIds` in `<Map>` (from `react-map-gl`) causes the component to re-render and re-bind event handlers on every render cycle, degrading performance.
**Action:** Use `useMemo` to memoize the array of interactive layer IDs, ensuring it only updates when `activeLayers` changes. Keep it at the top level to avoid hook rules violations.
