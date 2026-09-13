## 2024-05-24 - Memoizing map event layers preserves MapLibre performance
**Learning:** Passing an inline array or newly instantiated reference to `interactiveLayerIds` in react-map-gl (`<Map interactiveLayerIds={[...activeLayers]} />`) causes severe performance bottlenecks because the component unbinds and rebinds all map event listeners (click, hover, etc.) on every render.
**Action:** Always extract inline arrays or mapped dynamically generated IDs for MapLibre/react-map-gl interactive properties into a top-level `useMemo` hook to strictly preserve referential equality.
