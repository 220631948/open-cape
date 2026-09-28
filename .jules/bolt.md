## 2023-09-28 - Optimize inline array creation in Map component props
**Learning:** The `Map` component from `react-map-gl` was receiving a newly created array for `interactiveLayerIds` on every render due to inline mapping and spreading. This caused unnecessary referential inequality and re-renders of the complex Map component.
**Action:** Extract inline array/object prop generation into `useMemo` hooks (e.g., `interactiveLayerIds = useMemo(...)`) scoped outside the JSX to maintain referential equality across renders unless dependencies change.
## 2023-09-28 - Optimize inline function creation in Map component props
**Learning:** The `Map` component from `react-map-gl` was receiving a newly created async function for `onClick` on every render. This caused unnecessary referential inequality and re-renders of the complex Map component.
**Action:** Extract inline function prop generation into `useCallback` hooks (e.g., `handleMapClick = useCallback(...)`) scoped outside the JSX to maintain referential equality across renders unless dependencies change.
