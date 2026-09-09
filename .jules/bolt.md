## 2024-05-15 - React Map GL Interactivity Re-renders
**Learning:** Providing inline arrays to the `interactiveLayerIds` prop on `react-map-gl`'s `<Map>` component forces MapLibre to rebind interactivity events on every React render. In a heavy map component, this causes noticeable jank during interactions like panning or opening modals that trigger re-renders.
**Action:** Always memoize arrays or objects (using `useMemo`) passed as props to `<Map>` like `interactiveLayerIds` to preserve referential equality.
