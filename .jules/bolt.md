## 2024-07-24 - React Map-GL prop referential equality
**Learning:** Map components (like react-map-gl) are highly sensitive to prop changes. Inline array initializations for props like `interactiveLayerIds` break referential equality, forcing the underlying map context to unnecessarily diff layers and re-bind event listeners on every render, causing massive CPU spikes and jitter.
**Action:** Always memoize arrays and objects passed to heavy component wrappers (like Map) using `useMemo` at the top level of the component to preserve reference stability across renders.
