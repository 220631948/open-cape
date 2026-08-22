## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2026-08-22 - Added accessibility to interactive map panel controls
**Learning:** Layer toggles and base map selections lacking ARIA attributes create invisible traps for screen reader users.
**Action:** Use role='switch' with aria-checked for toggles and aria-pressed for grouped buttons, paired with descriptive aria-labels, to ensure state clarity.
