## 2024-05-18 - MapGL Re-render Performance Issue
**Learning:** In a heavily reactive environment, passing inline arrays to MapGL components prop like `interactiveLayerIds={...}` causes MapGL to rebind all interactions aggressively since referential equality breaks upon every React re-render.
**Action:** Use `useMemo` to cache arrays/objects for such components dependent on stable references.
