## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2024-08-25 - Icon-only buttons accessibility pattern
**Learning:** Generic icon-only buttons (like those using `lucide-react` icons in standard `Button` components) often miss `aria-label` and `title` attributes. Without them, screen readers announce generic or confusing elements. Furthermore, the icons themselves can be read out redundantly if not hidden with `aria-hidden="true"`.
**Action:** When working on UI components that use icon-only buttons, consistently add `aria-label` and `title` for context and hover interaction, while also adding `aria-hidden="true"` to the decorative child icon elements.
