## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.
## 2026-08-28 - Added accessible labels to Icon-only Buttons in TasksPage
**Learning:** Found an instance where generic `<Button size="icon">` elements used for task management actions (Add subtask, Edit task, Delete task) lacked accessible names and hover tooltips. This is a common pattern in the app.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons containing `lucide-react` icons, ensure the inner icon has `aria-hidden="true"`.
