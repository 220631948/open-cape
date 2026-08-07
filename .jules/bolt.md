## 2024-05-18 - Extracted interactiveLayerIds to useMemo in MapPage
**Learning:** In MapLibre/react-map-gl integrations, passing a new array on every render to `interactiveLayerIds` causes re-evaluation and event binding issues. The array can be complex because it maps across state (like `activeLayers`).
**Action:** When dynamic layer IDs are used for interactivity, always wrap the generated array in a `useMemo` with the relevant state values as dependencies to preserve referential equality.
