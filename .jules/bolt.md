## 2026-08-23 - Memoize Map Component Props
**Learning:** The `react-map-gl` `Map` component is sensitive to prop referential equality. Passing inline arrays like `interactiveLayerIds={[]}` directly in the JSX causes unnecessary and expensive re-renders of the map canvas on every parent render cycle, even if the elements within the array are identical.
**Action:** Always extract inline arrays or objects passed as props to heavily interactive components (like maps or canvas wrappers) into `useMemo` hooks to preserve referential equality and optimize performance.
