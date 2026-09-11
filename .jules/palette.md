## 2024-05-18 - Tooltips and ARIA for Action Buttons
**Learning:** Generic icon-only interactive elements (like `<Button size="icon">`) without `aria-label` or `title` properties are frequently found across the app, degrading screen reader accessibility and hiding context from standard mouse users.
**Action:** When adding accessible attributes to icon-only buttons, always include `aria-label` and `title` properties for context, and add `aria-hidden="true"` to their inner icon components. Ensure dynamic contexts (like in maps/lists) are interpolated.
