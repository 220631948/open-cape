## 2024-03-24 - Handling Auto-Generated Build Artifacts in PRs
**Learning:** Running verification commands like `pnpm build` generates large artifacts (e.g., `dist/`) which can mistakenly get added to staging, leading to unreviewable and unmergeable PRs.
**Action:** Always verify `git status` and specifically `git diff --cached` after running build steps. Use `git restore --staged .` followed by `git add <specific file>` instead of `git commit -a` to strictly limit the commit to intentional source modifications.
