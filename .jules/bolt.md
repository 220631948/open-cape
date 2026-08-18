## 2025-02-15 - React Map Component Prop Memoization
**Learning:** Supplying unmemoized dynamic objects, inline arrays, and functions to heavy React components (like `react-map-gl`'s `<Map>`) can cause severe rendering bottlenecks and costly event rebindings since the props lose referential equality across renders.
**Action:** Always memoize complex, dynamic objects or arrays being passed as props using `useMemo` and functions with `useCallback` to ensure reference stability in `<Map>` configurations.
