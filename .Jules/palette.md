## 2026-07-01 - Adding Accessible Labels to Icon Buttons
**Learning:** Found a widespread pattern of icon-only interactive `<Button size="icon">` elements lacking descriptive `aria-label` and `title` tags across the app, degrading keyboard navigation and screen-reader experience.
**Action:** Always ensure that any generic interactive wrapper (like a Button without textual children) requires explicit `aria-label` descriptions in its props to comply with WCAG standards and improve micro-UX hover states.
