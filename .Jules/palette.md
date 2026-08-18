## 2024-05-15 - Contextual screen reader patterns for drag-and-drop lists
**Learning:** Found a pattern where interactive drag-and-drop components (`@dnd-kit/core`) are missing standard keyboard/assistive instructions.
**Action:** When working with dnd-kit or custom drag handles, proactively ensure the handle has an informative `aria-label` like "Drag to reorder task" and a hover `title`.
