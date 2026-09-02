## 2024-09-03 - Contextual ARIA labels and Titles in Lists

**Learning:** Generic aria-labels and titles like 'Hide layer' or 'Adjust opacity' within mapped list items are indistinguishable to screen reader users when navigating iteratively through a list.
**Action:** Always interpolate the item's name or ID contextually into the `aria-label` and `title` (e.g., `aria-label="Hide ${name} layer"`) when adding accessible attributes inside a map function or repeated list component.
