## 2026-06-11 - Optimize Array Allocations in Map Data Loop
**Learning:** In hot loops processing thousands of GeoJSON features (e.g., ActiveVectorLayer), methods like `Object.keys().filter()` or nested `array.find()` create massive garbage collection pauses and exponential time complexity.
**Action:** Use pre-allocated `Set` objects and fast `for...in` loops with early exits for property checks, and convert secondary arrays to `Map` structures for O(1) lookups before iterating.
