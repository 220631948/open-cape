## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2023-10-25 - Custom Toggle Button Accessibility
**Learning:** Custom UI toggle buttons built with div/button primitives often lack proper semantic context for screen readers, leading to confusing states.
**Action:** When implementing custom UI toggle buttons (like for layer visibility or modes), always use `role="switch"` and `aria-checked` to ensure proper screen reader context. For grouped selection buttons (like map types), use `aria-pressed` to denote active states. Ensure `title` attributes are dynamic and reflect the action clearly.
