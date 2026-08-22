## 2023-10-27 - Map Component Re-renders

**Learning:** When passing inline arrays like `interactiveLayerIds` to complex React components (such as react-map-gl's `Map`), React's reconciliation process will trigger a re-render because the array reference changes on every render cycle. This is particularly expensive for Map components, causing significant performance degradation and lag during user interactions.
**Action:** Always extract inline array and object definitions that are passed as props to expensive components into a `useMemo` hook, ensuring that referential equality is preserved across renders when dependencies haven't changed.
