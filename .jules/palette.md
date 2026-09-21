## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2026-09-21 - Enhance map radius selection accessibility
**Learning:** Map interface controls like radius toggles often rely solely on active class styles. Screen readers require `role="group"` and `aria-pressed` for users to understand that these are grouped, selectable toggles, not just individual disconnected buttons.
**Action:** When implementing any grouped selection buttons (like map types, filters, or radiuses), always wrap them in a container with `role="group"` (and `aria-label`) and use `aria-pressed={isActive}` on the individual buttons to denote active states, in addition to explicit aria-labels if the text content is abbreviated (e.g. "100m" -> "100 meters").
