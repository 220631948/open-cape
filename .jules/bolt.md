## 2026-06-27 - Hooks in JSX are Anti-Patterns
**Learning:** Defining `useMemo` and `useCallback` inside component JSX instead of at the top-level can introduce stale closure bugs and is a severe anti-pattern as it could violate Rules of Hooks if rendered conditionally.
**Action:** Always define React hooks at the top level of the component and use thorough dependency arrays.
