## 2024-07-31 - Accessibility missing on critical layout menu toggle and app watchlists
**Learning:** Found critical layout action buttons (Menu Drawer, App Watchlists) missing proper context.
**Action:** Implemented standard pattern of adding `aria-expanded` along with dynamic `aria-label` and `title` for stateful buttons and icon-only buttons, as well as applying `aria-hidden="true"` on inner decorative content (icons, visual badges) to prevent redundant SR readouts.
