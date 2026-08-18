## 2024-03-24 - Accessibility pattern for icon buttons
**Learning:** Found several missing `aria-label` attributes on icon-only buttons across the codebase (e.g. OsintDrawer, LayerPanel, DrawToolbar, RightDetailDrawer, SaveMapDialog, AddBookmarkDialog, etc).
**Action:** Consistently add `aria-label` attributes to `<Button size="icon">` and `<button>` components when the content is only an icon.
