## 2024-10-27 - Memoize Map Props
**Learning:** Supplying inline arrays (like `interactiveLayerIds`) or inline functions (like `onLoad` or `onData`) directly to complex map components (e.g., `react-map-gl/maplibre`) causes unnecessary referential inequality on every render of the parent component. This can trigger expensive internal map state updates or re-renders, especially when interacting with the map.
**Action:** Always extract static or derived arrays and functions passed to map components into `useMemo` and `useCallback` hooks with proper dependency arrays.
