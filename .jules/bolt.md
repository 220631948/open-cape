## $(date +%Y-%m-%d) - Prevent React Map GL Re-renders
**Learning:** In applications using MapLibre/react-map-gl, passing inline arrays to props like `interactiveLayerIds` or inline functions for events like `onLoad` and `onData` breaks referential equality on every render, causing the map to repeatedly re-bind events and process layer interactivity. This degrades performance significantly with many layers.
**Action:** Always wrap arrays for map props (e.g., `interactiveLayerIds`) in `useMemo` and event handlers in `useCallback` to maintain referential equality across React renders.
