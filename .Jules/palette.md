## 2026-06-28 - [Layer Panel Accessibility]
**Learning:** Custom toggle buttons and grouped selection buttons in the map components often lack proper ARIA roles and states to denote their active/inactive status to screen readers.
**Action:** When implementing custom UI toggle buttons, always use `role="switch"` and `aria-checked`. For grouped selection buttons (like map types), use `aria-pressed` to denote active states.
