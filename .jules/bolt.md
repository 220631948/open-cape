## 2024-05-19 - MapLibre React Re-render Bottlenecks
**Learning:** In applications using `react-map-gl`/`maplibre`, inline array constructions (like `.map()`, `.filter()`) passed directly as props (e.g., `interactiveLayerIds={[]}`) create new array references on every React render. This breaks referential equality and forces expensive Map component re-renders, causing noticeable lag when layers change.
**Action:** Always extract dynamic array or object props for Map components into `useMemo` hooks with tight dependency arrays to preserve referential equality across renders.
