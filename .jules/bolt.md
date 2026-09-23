## 2024-05-18 - react-map-gl Referential Equality

**Learning:** When using `react-map-gl`, supplying inline arrays (like `interactiveLayerIds`) or inline functions (like `onData`) causes the `<Map>` component to continuously unbind and rebind internal listeners on every render, severely impacting performance. It breaks the internal React memoization bounds.

**Action:** Always wrap dynamically calculated props passed directly to `<Map>` in `useMemo` or `useCallback` to preserve referential equality unless dependencies genuinely change.
