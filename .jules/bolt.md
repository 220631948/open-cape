## 2024-05-17 - Preserve Referential Equality for Mapped Props

**Learning:** When passing array props that are calculated dynamically based on other state or props (like `activeLayers.map(...)`) into performance-sensitive React components like `react-map-gl`'s `Map` component (e.g. for `interactiveLayerIds`), these inline array declarations will cause the prop's referential equality to break on every single render. This leads to costly event re-evaluations or map re-bindings on high-frequency state changes like viewstate updates (`onMove`).

**Action:** Always refactor inline array maps or dynamically generated lists into a `useMemo` block that explicitly depends on the required state variables before passing them into the React component props. This ensures the prop reference remains identical across un-related renders, minimizing component churn.
