## 2024-11-20 - React Map GL Render Optimization
**Learning:** In a heavily map-reliant React application (react-map-gl), inline arrays passed to map component props like `interactiveLayerIds` cause a new array reference on every render, triggering full map re-renders and costly event rebindings even if the actual contents are identical.
**Action:** Always wrap arrays or objects passed to map component props (like `interactiveLayerIds`, `sources`, `layers`) in a `useMemo` hook with proper dependencies to preserve referential equality and prevent costly re-renders.
