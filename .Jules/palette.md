## 2024-05-18 - Missing ARIA Labels on Icon-Only Interactive Elements
**Learning:** There is a widespread pattern in this codebase of using `<Button size="icon">` containing only a Lucide icon without an `aria-label` or `title` attribute, making these elements completely inaccessible to screen readers and lacking hover context for mouse users.
**Action:** Always verify that generic interactive elements (especially icon-only buttons) include explicit `aria-label` and `title` properties.
