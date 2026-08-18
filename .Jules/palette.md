## 2024-05-19 - Interactive Drag Handle Accessibility
**Learning:** Custom interactive elements like dnd-kit drag handles implemented as `<div>`s often lack basic keyboard accessibility out of the box, breaking keyboard navigation for users relying on it to discover interactive lists.
**Action:** Always verify keyboard focusability (`tabIndex={0}`) and semantic roles (`role="button"`) when implementing or encountering custom drag handles or sortable elements, alongside descriptive `aria-label`s.
