## 2024-06-25 - React-map-gl Referential Equality

**Learning:** When passing `interactiveLayerIds` to the `<Map>` component from `react-map-gl`, creating an array inline causes unnecessary internal re-evaluations and performance degradation because it breaks referential equality on every render.
**Action:** Always wrap dynamically generated lists of layer IDs in a `useMemo` hook with proper dependencies to ensure referential equality.
