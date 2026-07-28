# Deferred Features (MVP 2)

Tracks features deferred to keep MVP 1 focused on indexing fidelity + article publication. Reason and revisit condition recorded for each, per Part 6 §6.

## 1. Cross-Journal Author Profile Pages (`/author/[author_slug]`)
- **Reason:** Indexing correctness and the article landing page are the critical path. Linking an author's papers across journals is valuable but not part of MVP 1's mission.
- **MVP 2 scope:** A unified profile showing an author's papers across all journals, keyed by ORCID.

## 2. `modified/` Folder State Transitions
- **Reason:** MVP 1 redeploys by replacing the file in `published/` and triggering the Humble Rebuild (Part 11 §7). A distinct `modified/` state would add CI/CD complexity without indexing value.
- **MVP 2 scope:** Formal `new/` → `published/` and `modified/` → `published/` transitions in the pipeline.

## 3. Real-Time SSR / Live Database
- **Reason (Vision Decision):** SSR or live-DB calls add runtime failure modes and contradict the humble-code philosophy. SSG is resilient and ideal for crawlers; Google Scholar updates on a 6–9 month cycle, so real-time rendering solves a problem the crawler does not have.
- **Status:** **Permanently deferred.** Rebuilds triggered by backend webhooks remain the strategy.

## 4. Cross-Journal Author Search
- **Reason:** Individual journal archives are sufficient for MVP 1 crawlability (the Part 10 ≤7-click rule is satisfied per-journal). Cross-journal search is a discovery convenience, not an indexing requirement.
- **MVP 2 scope:** A unified search across all journals.

## 5. Full Automation of the `new/` → `published/` CI Move
- **Reason:** For MVP 1 the operator moves a paper from `new/` to `published/` after a successful deploy. Automating this is a CI/CD task, not a frontend correctness task.
- **MVP 2 scope:** A pipeline step that moves files post-build and triggers the next deploy.

## 6. Journal Logo Rendering
- **Reason:** `themes.json` already carries `logo_url` per journal (contract intact), but the actual SVG assets are owned by the brand team and not yet committed. Rendering now would emit broken `<img>` refs — a Part 10 crawlability/quality violation.
- **Revisit:** When the brand owner commits the SVGs to `public/assets/logos/`, render the logo on the journal archive and article pages in one pass.

## 7. Interactive Editorial / Submission Dashboards
- **Reason:** Out of scope. The Python backend processes DOCX → PDF/HTML; this frontend is strictly a public-facing reader interface.
