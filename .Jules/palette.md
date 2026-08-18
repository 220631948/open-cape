## 2026-06-25 - Custom Switch Accessibility Pattern
**Learning:** Custom toggle buttons (pill switches) built with `<div>` or `<button>` without native input elements frequently lack the semantic `role="switch"` and state attribute `aria-checked`.
**Action:** Always verify that any UI element acting as a toggle switch includes `role="switch"` and a dynamically bound `aria-checked` attribute, along with an `aria-label` for context.
