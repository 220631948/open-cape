## 2024-05-15 - Missing ARIA attributes on Icon-only Buttons
**Learning:** Found multiple instances where `<Button size="icon">` lacks accessible names (`aria-label`, `title`) and state indicators (`aria-expanded`). This is especially critical for mobile drawer toggles and notification bells containing visual badges.
**Action:** Always verify that generic icon buttons include explicit `aria-label` and `title` properties. For buttons with dynamic state (menus, drawers), use `aria-expanded`. For buttons with visual status (unread counts), ensure context is in the `aria-label` and use `aria-hidden="true"` on the icon/badge.

## 2024-06-25 - Contextual Accessibility for Mapped List Buttons
**Learning:** Generic aria-labels and titles like 'Hide layer' on buttons within mapped lists are insufficient for screen readers because they don't distinguish which specific list item (e.g., which layer) is being targeted.
**Action:** Always interpolate the list item's contextual identifier (e.g., name or ID) into `aria-label` and `title` attributes (e.g., `aria-label={"Hide " + name + " layer"}`) when rendering interactive elements inside a mapped array.

## 2024-06-25 - ARIA roles for Map Type Button Groups
**Learning:** Found custom button groups (like map type selectors for street, topo, satellite) lacking semantic grouping and state representation for assistive technologies.
**Action:** When implementing grouped selection buttons, wrap the group in a container with `role="group"` and an `aria-label` describing the group. Use `aria-pressed={isActive}` on the individual buttons to denote their active selection state.

## 2024-06-25 - ARIA roles for Switch Toggles
**Learning:** Found custom toggle buttons lacking proper switch semantics for screen readers.
**Action:** When implementing custom UI toggle buttons, always use `role="switch"` and `aria-checked={isActive}` to ensure proper screen reader context, rather than relying solely on visual cues or generic button roles.
