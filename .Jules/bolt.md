## 2026-08-02 - Memoize Map Props for Referential Equality
**Learning:** React-map-gl is highly sensitive to prop referential equality. Passing inline arrays to props like `interactiveLayerIds` causes the map to re-evaluate layers on every render, which creates significant performance overhead during state updates (like drawing, panning, or hovering).
**Action:** Always wrap arrays, objects, and callback functions passed as props to `react-map-gl`'s `<Map>` component in `useMemo` and `useCallback` to preserve referential equality across renders.
