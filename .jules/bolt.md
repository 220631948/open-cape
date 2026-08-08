## 2024-05-18 - Memoize MapPage properties
**Learning:** Extracting inline arrays and objects like `interactiveLayerIds` to `useMemo` hooks is critical for components like `Map` from `react-map-gl`, because it uses referential equality checks. Providing new references on every render can cause costly event re-bindings and re-renders in heavy Map components.
**Action:** Always memoize `interactiveLayerIds` and similar array/object props passed directly to `react-map-gl` components to preserve referential equality and optimize performance.
