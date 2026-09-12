## 2024-05-13 - Memoizing interactiveLayerIds to Prevent Map Re-Renders
**Learning:** In applications using `react-map-gl`, passing inline arrays like `interactiveLayerIds` triggers costly re-evaluations and event listener rebindings within the library on every re-render because of referential inequality.
**Action:** Always wrap complex or derived arrays passed as props to the `Map` component (such as `interactiveLayerIds` constructed from `.map` and `.filter`) in a `useMemo` hook with appropriate dependencies to preserve referential equality and optimize performance.
