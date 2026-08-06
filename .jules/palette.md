## 2024-05-18 - Missing ARIA Labels on Icon-only Panel Toggles
**Learning:** Icon-only buttons used for expanding/collapsing drawer panels frequently lack proper accessibility context (`aria-label`, `title`) and mistakenly expose their inner SVGs to screen readers, creating poor experiences.
**Action:** When creating or reviewing icon-only panel toggles, always ensure they include an explicit `aria-label`, a contextual `title` for hover tooltips, and apply `aria-hidden="true"` to the inner decorative SVG element.
