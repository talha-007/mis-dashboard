# Codebase cleanup and audit plan

This document is a **step-by-step checklist** to make the MIS dashboard code clean, documented, well structured, and robust against **limitations and edge cases**. Work through it in order; tick items as you complete them.

---

## Principles

- **Small, focused changes**: Prefer one area or PR-sized slice at a time.
- **No drive-by refactors**: Fix what the step asks for; avoid unrelated churn.
- **Evidence**: After each major step, run lint, typecheck, and (where relevant) tests.
- **Document decisions**: If behavior is non-obvious (API quirks, browser limits), add a short comment or doc section.

---

## Phase 1 — Baseline and tooling

| Step | Action | Done |
|------|--------|------|
| 1.1 | Record current Node/npm versions and lockfile policy (use what the repo expects). | ☑ |
| 1.2 | Run full **ESLint** on the repo; fix or track violations (use `--fix` where safe). | ☑ |
| 1.3 | Run **TypeScript** (`tsc --noEmit` or project script); resolve errors before deeper cleanup. | ☑ |
| 1.4 | Run **unit/e2e tests** if present; note failing suites for follow-up. | ☑ |
| 1.5 | Optional: enable or document **strict** TS checks (e.g. `noUnusedLocals`) if not already on. | ☑ |

### Baseline log (2026-04-14)

| Item | Result |
|------|--------|
| **Node / npm** | Node ≥20 per `package.json`; example dev machine: Node v20.19.5, npm 10.8.2 |
| **Package manager** | `packageManager`: **yarn@1.22.22** (lockfile policy: use Yarn 1.x when installing) |
| **ESLint** | `npm run lint` — **0 errors, 0 warnings** (after cleanup pass) |
| **TypeScript** | `npx tsc --noEmit` — **pass**; `tsconfig.json` has `strict`, `strictNullChecks`, `noEmit` |
| **Tests** | No `test` script in `package.json`; add Vitest/Jest later if you want automated tests |
| **Phase 1.5** | `noUnusedLocals` / `noUnusedParameters` not enabled in repo; optional follow-up |

**Cleanup applied in this pass:** Resolved prior ESLint warnings (unused vars, `import()` type style, hook deps, `react-toastify`/`react` import ordering where needed), removed dead handlers where UI was commented out, aligned `credit-proposal` / `payment` / `recovery` filter state with commented tabs, used `omit` for register payload, wrapped `fetchBorrowers` in `useCallback` in `borrower-view`.

---

## Phase 2 — Repository map (modules to review)

Review **each area** below in order (or assign owners per slice). For each: folder layout, public vs internal APIs, duplication, and entry points.

| Area | Typical paths | Done |
|------|----------------|------|
| 2.1 App bootstrap & routes | `src/main.tsx`, `src/app.tsx`, `src/routes/**` | ☐ |
| 2.2 Layouts & navigation | `src/layouts/**` | ☐ |
| 2.3 Auth & guards | `src/auth/**`, route guards, token handling | ☐ |
| 2.4 Redux store & services | `src/redux/**` | ☐ |
| 2.5 Shared UI components | `src/components/**` | ☐ |
| 2.6 Utils & formatting | `src/utils/**` | ☐ |
| 2.7 Types | `src/types/**` | ☐ |
| 2.8 Bank admin sections | `src/sections/Bankadmin/**` | ☐ |
| 2.9 Customer sections | `src/sections/customer/**` | ☐ |
| 2.10 Employee sections | `src/sections/Employee/**` | ☐ |
| 2.11 Other sections / portfolio | `src/sections/**` (remainder) | ☐ |
| 2.12 Pages (thin wrappers) | `src/pages/**` | ☐ |

For **each** row, capture in notes (short bullets):

- **Responsibility**: What this module owns.
- **Dependencies**: What it must not import (avoid upward/circular deps).
- **Known limitations**: e.g. pagination caps, file size limits, API timeouts.

---

## Phase 3 — Structure and consistency

| Step | Action | Done |
|------|--------|------|
| 3.1 | **Naming**: Align components (`PascalCase`), hooks (`use*`), files with default export vs named export conventions used elsewhere in the repo. | ☐ |
| 3.2 | **Imports**: Follow ESLint `perfectionist/sort-imports` (or project rules); no mixed `import type` + value in one statement when values are needed at runtime. | ☐ |
| 3.3 | **Barrels** (`index.ts`): Use only where they clarify public API; avoid deep circular imports. | ☐ |
| 3.4 | **Split large files**: Views or services over ~500–800 lines → extract hooks, subcomponents, or service helpers. | ☐ |
| 3.5 | **Dead code**: Remove unused exports/imports; confirm with lint and usage search before deleting. | ☐ |

---

## Phase 4 — Documentation (lightweight, useful)

| Step | Action | Done |
|------|--------|------|
| 4.1 | **README** (root or `docs/`): How to install, run dev server, lint, test, build, env vars. | ☐ |
| 4.2 | **Redux/services**: Document base URL, auth headers, and error-handling expectations (see `src/redux/services/README.md` if applicable). | ☐ |
| 4.3 | **Non-obvious UI**: Short comments for complex tables, wizards, or state machines (why, not what). | ☐ |
| 4.4 | **Types**: Export shared domain types from `src/types/**`; JSDoc on public shapes when the API is unclear. | ☐ |

---

## Phase 5 — Limitations and edge cases (by category)

Work through these **per feature** or **per module** as you touch code.

### Data and API

| Check | Done |
|--------|------|
| Empty lists, `null`/`undefined` payloads, missing optional fields | ☐ |
| Loading / error / retry states; user-visible error messages | ☐ |
| Pagination: first/last page, page size zero, stale responses | ☐ |
| Time zones: display vs UTC (`format-time` usage consistent) | ☐ |

### Forms and validation

| Check | Done |
|--------|------|
| Required fields, trim whitespace, numeric bounds | ☐ |
| Submit disabled while pending; double-submit prevention | ☐ |
| Server validation errors mapped to fields | ☐ |

### Files and uploads

| Check | Done |
|--------|------|
| Allowed types, max size, clear rejection UX | ☐ |
| Progress and failure handling | ☐ |

### Security and privacy

| Check | Done |
|--------|------|
| No secrets in client bundle; env usage documented | ☐ |
| Sensitive data not logged to console in production | ☐ |

### UI / UX

| Check | Done |
|--------|------|
| Responsive breakpoints; overflow (tables, dialogs) | ☐ |
| Accessibility: focus trap in dialogs, labels on inputs | ☐ |

---

## Phase 6 — Verification before “done”

| Step | Action | Done |
|------|--------|------|
| 6.1 | ESLint clean (or only accepted suppressions with comments). | ☐ |
| 6.2 | TypeScript clean. | ☐ |
| 6.3 | Build succeeds (`npm run build` or equivalent). | ☐ |
| 6.4 | Smoke-test critical flows: login, main dashboards, one create/edit path per role if applicable. | ☐ |

---

## How to use this doc

1. Complete **Phase 1** first so fixes are trustworthy.
2. Go through **Phase 2** module by module; keep a short log (optional) in `docs/` or team wiki.
3. Apply **Phases 3–5** in the same area you are touching to avoid endless repo-wide churn.
4. Use **Phase 6** before merging a milestone.

---

## Revision history

| Date | Change |
|------|--------|
| 2026-04-13 | Initial checklist created. |
| 2026-04-14 | Phase 1 baseline completed; baseline log added. |
