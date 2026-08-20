## 2024-08-20 - Memoize interactiveLayerIds
**Learning:** Passing an inline array for `interactiveLayerIds` to react-map-gl breaks referential equality, causing unnecessary work and map re-renders on every parent render cycle, especially in a dynamic Map context.
**Action:** Always wrap arrays/objects passed to map components (like interactiveLayerIds or layer props) in `useMemo`.

## 2024-08-20 - Source Component Key Prop
**Learning:** The `Source` component from `react-map-gl` does not natively support a `key` prop in the same way standard React components do (or at least TypeScript throws an error if it's not explicitly in `SourceProps`). To render a list of sources dynamically, you might need to use a React Fragment (`<React.Fragment key={id}>`) as a wrapper to satisfy React's key requirement without angering TypeScript.
**Action:** Wrap dynamically mapped `Source` components in a `<Fragment key={...}>` rather than putting the `key` directly on the `Source` if TypeScript complains about `SourceProps`.
