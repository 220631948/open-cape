## 2024-03-24 - Screen Reader Compatibility for Decorative Icons
**Learning:** When using accessible `aria-label` or `title` on parent icon-only buttons (like Watchlist notifications with badges), screen readers may redundantly or confusingly read child text (like '9+') and visual SVG elements if they are not explicitly hidden.
**Action:** Always append `aria-hidden="true"` to SVG icons and status badges inside icon-only buttons when a comprehensive `aria-label` is applied to the parent element.
