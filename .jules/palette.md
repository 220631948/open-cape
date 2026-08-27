## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2024-08-27 - Contextual ARIA labels on repeated list controls
**Learning:** Generic aria-labels and titles like "Adjust opacity" or "Hide layer" within mapped list items are indistinguishable to screen reader users when navigating iteratively through a list.
**Action:** When adding accessible attributes inside a map function or repeated list component, always interpolate the item's name or ID contextually into the `aria-label` and `title` (e.g., `aria-label="Hide ${name} layer"`).
