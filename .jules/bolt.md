## 2024-05-24 - React-Map-GL referential equality bottleneck
**Learning:** Map components from `react-map-gl` rely heavily on referential equality for props like `interactiveLayerIds` to determine if they should re-bind internal events or force an update. Inline array creation causes constant re-binding which degrades performance, especially in components that re-render frequently from mouse movement or draw state changes.
**Action:** Always memoize arrays or objects passed directly into Map component props, especially those that trigger interactivity updates.
