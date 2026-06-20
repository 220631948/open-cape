## 2026-06-20 - Preserve Referential Equality for Map Properties
**Learning:** In react-map-gl/maplibre, passing inline arrays to props like `interactiveLayerIds` causes the map to re-evaluate and re-render on every cycle, which is a major performance bottleneck. Build artifacts (e.g., `dist/`) and temp files should never be committed.
**Action:** Always wrap array and object props passed to Map components in `useMemo` to preserve referential equality. Explicitly remove build artifacts before committing.
