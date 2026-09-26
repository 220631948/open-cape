## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2026-09-26 - Missing ARIA Labels on Inline Loading Indicators
**Learning:** Discovered that inline loading spinners (like `Loader2` from lucide-react) used within async submit buttons or component headers lack screen reader context, failing to announce loading states to assistive technologies.
**Action:** When adding or discovering inline loading spinners, always attach `aria-label` (e.g., 'Loading...') and `role="status"` to ensure screen readers announce the state change.
