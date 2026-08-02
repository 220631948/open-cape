## 2024-05-15 - Inner Icon ARIA Hidden
**Learning:** When adding ARIA labels to icon-only buttons that wrap SVG components (like lucide-react icons), it's important to also apply `aria-hidden="true"` to the inner icon element. Otherwise, screen readers may announce both the button's label and a generic 'image' or 'graphic' for the SVG, causing confusing duplicate readouts.
**Action:** Always pair an `aria-label` on an icon-only button with `aria-hidden="true"` on its immediate child icon element.
