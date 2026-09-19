## 2024-05-17 - Prevent Map re-renders with memoized arrays
**Learning:** ReactMapGL `Map` components often re-render when inline arrays or objects are passed as props, particularly `interactiveLayerIds`. Since the `MapPage` is heavily interactive and involves multiple state updates, these inline collections result in referential inequality and subsequent expensive component updates.
**Action:** Extract inline arrays to `useMemo` hooks, keeping referential equality for complex props like `interactiveLayerIds` to avoid performance degradation.
