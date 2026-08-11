# Challenge → Branch Map

Tracks every challenge to its dedicated git branch, **across both repositories**
(frontend `autopub_frontend_server`, backend `auto_pub_dev_ams`). The same
challenge id maps to a paired branch in each repo, so a challenge's work is
containerized and cleanly mergeable.

## Convention

- Branch naming: `challenge/<challenge-id>` — e.g. `challenge/1.2` for the
  asset-base + domain-rename challenge.
- A challenge may span repos: the branch name is identical in both, and each
  repo's branch carries only that repo's slice.
- Work happens on the branch; the **Review + Security agents** verify on the
  branch; only a green, reviewed branch merges to `main`.
- The 0.0-challenge-ranking-list.md `Status` column links to the branch name.

## Active challenges

| Challenge | Frontend branch | Backend branch | Status |
|-----------|-----------------|----------------|--------|
| 1.2 — Asset-base under `/journals` reverse proxy + root-domain rename (URL-only) | `challenge/1.2` | `challenge/1.2` | **PAUSED** (2026-08-11, styling-issue fork: `base` doesn't restructure `dist/`; see `1.2-deployment-edge-rewrites-sitemap.md`) |
| 29 — Relax author-email pre-checks (ORCID as contact) | n/a (backend-only) | `challenge/29` | Pending — Next One after 1.2 resolves |

## Resolved / merged

(To be filled as challenges complete.)

## Notes

- The frontend `worktree-fix-tailwind-source` branch is a stale snapshot
  (`.claude/worktrees/`); do not merge it.
- Rollback checkpoint for the styling issue: frontend `75498a8` (last commit
  before the page-move + `base` work); backend `3942479` (unaffected — only
  3 doc/comment lines changed since).
