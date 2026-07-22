## 2024-03-24 - React-Map-GL Reactivity Performance Trap
**Learning:** `react-map-gl` heavily relies on referential equality for key props like `interactiveLayerIds` and callback functions (e.g., `onLoad`, `onData`). If these are defined inline, it causes costly event re-bindings on every single component render.
**Action:** Always extract static array configurations and inline functions into `useMemo` and `useCallback` hooks when working with `react-map-gl` to preserve referential equality and optimize rendering performance.
