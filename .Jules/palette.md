## 2024-06-18 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found a widespread pattern across the application where icon-only buttons (like "Close" `X` buttons or "Delete" `Trash2` buttons) are missing `aria-label` attributes and proper `focus-visible` styling for keyboard navigation. This significantly degrades screen reader accessibility and keyboard usability.
**Action:** When implementing new UI components or reviewing existing ones in this app, explicitly check all icon-only interactive elements for `aria-label` and ensure they have a clear `focus-visible` ring.
