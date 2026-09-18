## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.
## 2024-05-15 - Add ARIA Labels to DrawingCard Action Buttons
**Learning:** Generic icon-only action buttons in repeated components (like DrawingCard) lack contextual accessibility. Adding `aria-label` with interpolated item titles (e.g., `aria-label={\`Edit ${drawing.title || 'drawing'}\`}`) provides necessary context for screen readers iterating through lists.
**Action:** Always interpolate item-specific context into `aria-label` and `title` attributes on interactive elements within mapped lists or cards, and include `aria-hidden="true"` on inner icons.
