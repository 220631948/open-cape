## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.
## 2026-09-13 - Dynamic ARIA Labels for Mapped Icon Buttons
**Learning:** When adding accessibility features to generic icon-only action buttons (like edit/delete) inside a repeated list component, static labels are insufficient because screen reader users cannot distinguish between them.
**Action:** Always interpolate the item's unique context (like its title or ID) directly into the `aria-label` and `title` attributes (e.g., `aria-label={`Edit ${item.name}`}`). Ensure the inner icon itself is marked with `aria-hidden="true"` to prevent duplicate readouts.
