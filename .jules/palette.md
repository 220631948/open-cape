## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2024-10-26 - Accessible Icon Buttons in Drawers and Panels
**Learning:** Found `<Button size="icon">` components used for toggling panels (like LayerPanel) without complete accessibility contexts. While `title` was sometimes present, proper screen reader names (`aria-label`) and state indicators (`aria-expanded`) were missing, and decorative inner icons lacked `aria-hidden`.
**Action:** When working with drawer or panel toggle icon buttons, always apply explicit `aria-label` and `title` properties. For toggles, explicitly bind `aria-expanded={isOpen}` to communicate the structural state, and add `aria-hidden="true"` to inner icon elements to avoid redundant readouts.
