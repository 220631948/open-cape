## 2026-07-29 - Memoize interactiveLayerIds in react-map-gl
**Learning:** Passing an inline array or dynamically generated array directly to the `interactiveLayerIds` prop of a map component (like `react-map-gl`) causes the component to break referential equality checks on every render. This leads to costly re-evaluations and re-bindings of map event handlers.
**Action:** Always wrap complex or dynamically generated arrays passed as props to heavy map components in a `useMemo` hook, ensuring the reference is stable unless the actual underlying dependencies (like `activeLayers`) change.
