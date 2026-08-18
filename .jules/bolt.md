## 2024-07-14 - React-map-gl Event Re-binding Performance Anti-Pattern
**Learning:** In MapLibre/react-map-gl, passing inline arrays to `interactiveLayerIds` or inline functions to `<Map>` components (like `onLoad` or `onData`) causes severe performance bottlenecks. React will see these as new references on every render, forcing the heavy map instance to re-diff interactive layers and unbind/rebind DOM events continuously.
**Action:** Always extract arrays passed to `interactiveLayerIds` into `useMemo` hooks, and event handlers like `onLoad`/`onData` into `useCallback` hooks.
