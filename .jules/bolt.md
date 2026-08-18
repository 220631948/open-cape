## 2024-05-24 - ActiveVectorLayer Object Property Check
**Learning:** Checking MapLibre/GeoJSON properties using `Object.keys().filter().includes()` creates severe garbage collection pauses when processing vector layers containing thousands of map features.
**Action:** When filtering GeoJSON feature properties for validity, use `for...in` loops and a `Set` for key filtering to enable O(1) checks and early exits.
