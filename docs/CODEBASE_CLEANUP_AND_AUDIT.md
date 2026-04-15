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
| 2.1 App bootstrap & routes | `src/main.tsx`, `src/app.tsx`, `src/routes/**` | ☑ |
| 2.2 Layouts & navigation | `src/layouts/**` | ☑ |
| 2.3 Auth & guards | `src/components/auth/**`, route guards, token handling | ☑ |
| 2.4 Redux store & services | `src/redux/**` | ☑ |
| 2.5 Shared UI components | `src/components/**` | ☑ |
| 2.6 Utils & formatting | `src/utils/**` | ☑ |
| 2.7 Types | `src/types/**` | ☑ |
| 2.8 Bank admin sections | `src/sections/Bankadmin/**` | ☑ |
| 2.9 Customer sections | `src/sections/customer/**` | ☑ |
| 2.10 Employee sections | `src/sections/Employee/**` | ☑ |
| 2.11 Other sections / portfolio | `src/sections/**` (remainder) | ☑ |
| 2.12 Pages (thin wrappers) | `src/pages/**` | ☑ |

### Phase 2 — Module audit (snapshot)

Use this as a **map for deeper reviews** (Phases 3–5). Paths reflect the repo layout; there is **no** top-level `src/auth/` — auth UI and route guards live under **`src/components/auth/`**.

#### 2.1 App bootstrap & routes

| | |
|--|--|
| **Responsibility** | `main.tsx` mounts the app: `AppProviders` → `AuthInitializer` → `RouterProvider`; global `ToastContainer`. `app.tsx` wraps routes in `ThemeProvider` and scrolls to top on navigation. **`routes/sections.tsx`** composes `authRoutes`, `bankDynamicRoutes`, protected dashboard (`ProtectedRoute` → `SubscriptionGuard` → `DashboardLayout` + lazy pages), and `errorRoutes`. Split route files: `routes-auth`, `routes-admin`, `routes-customer`, `routes-super-admin`, `routes-bank-dynamic`, `routes-error`. |
| **Entry points** | `src/main.tsx` → `routesSection` from `src/routes/sections.tsx`. |
| **Dependencies** | Routes should depend on **pages** and **guards**, not deep-import section internals. Avoid circular imports between route files and heavy views. |
| **Limitations / notes** | Lazy `Suspense` fallback is a linear progress bar only. **Error boundary** is the router `errorElement`. Role checks use `MultiRoleGuard` + `UserRole` from `src/types/auth.types`. |

#### 2.2 Layouts & navigation

| | |
|--|--|
| **Responsibility** | **`layouts/dashboard`**: shell, nav, header, content. **`layouts/auth`**: sign-in/register layouts. **`nav-config-dashboard.tsx`** defines per-role nav (`superAdminNavData`, `adminNavData`, customer, recovery officer) with `requiredRole` / `requiredPermission`. |
| **Entry points** | Used by `routes/sections.tsx` (`DashboardLayout`) and auth route modules. |
| **Dependencies** | Layouts may use `src/components/*`, `src/routes/hooks`, `src/types/auth.types`. Should **not** import feature sections directly (keep pages/sections as children). |
| **Limitations / notes** | Nav visibility must stay aligned with **`MultiRoleGuard`** routes or users see links they cannot open. |

#### 2.3 Auth & guards (and token handling)

| | |
|--|--|
| **Responsibility** | **`components/auth`**: `ProtectedRoute`, `AuthRouteGuard`, `MultiRoleGuard`, `RoleGuard`, `SubscriptionGuard`, `GuestOnlyRoute`, `CustomerBankGuard`, `AuthInitializer`, Google button. **Tokens**: `src/utils/auth-storage` + Axios interceptors in **`redux/services/http-common.tsx`** (refresh, `withCredentials`, redirect on 401). |
| **Entry points** | Router wraps in `ProtectedRoute` / `SubscriptionGuard`; `AuthInitializer` dispatches `initializeAuth` from **`redux/slice/authSlice`**. |
| **Dependencies** | Guards use `src/store` selectors only; avoid importing API services inside guard components when possible. |
| **Limitations / notes** | `AuthInitializer` intentionally does **not** block the whole app on `isLoading` (avoids router redirect loops — see comment in `auth-initializer.tsx`). Refresh uses `/api/auth/refresh-token`; timeout from **`ENV.API.TIMEOUT`** (default 30s). **`VITE_BYPASS_AUTH`** exists only for dev — do not rely on it in production. |

#### 2.4 Redux store & services

| | |
|--|--|
| **Responsibility** | **`redux/store.tsx`**: single slice **`auth`** today; `serializableCheck: false`. **`redux/services/`**: Axios instances (`http-common`), domain APIs (bank-admin, loan-applications, borrower, customer, employee, superadmin, assessment, payment, etc.), facades under `facades/`, **`README.md`** for patterns. **`src/services/socket`**: Socket.io client (related to notifications). |
| **Entry points** | `store` imported from `src/store/index.ts` (re-exports Redux store + hooks). |
| **Dependencies** | Services depend on **`http-common`** and **`src/config/environment`**. Slices should not import services (dispatch thunks or use hooks from views). |
| **Limitations / notes** | Some overlapping filenames (`employee.services.ts` vs `employee/employee.services.ts`) — confirm imports when adding features. API base URL: **`VITE_API_BASE_URL`**. Duplicate or legacy service paths possible; prefer documented entry in `redux/services/index.ts` / README when refactoring. |

#### 2.5 Shared UI components

| | |
|--|--|
| **Responsibility** | **`src/components/**`**: reusable UI (iconify, scrollbar, chart, form helpers, label, logo, settings drawer, notifications UI, etc.) and **`components/auth`**. |
| **Entry points** | Imported by layouts, sections, and pages. |
| **Dependencies** | Components should not import **page** or **section** views. Prefer `src/theme`, MUI, `src/utils`. |
| **Limitations / notes** | Keep presentational vs container split where charts/forms are reused across roles. |

#### 2.6 Utils & formatting

| | |
|--|--|
| **Responsibility** | **`src/utils/**`**: `format-time`, `format-number`, `auth-storage`, `role-home-path`, `bank-context`, debounce hooks live under **`src/hooks`** (paired with utils conceptually). |
| **Entry points** | Used across sections for dates, currency, redirects after login. |
| **Dependencies** | Utils must stay free of React/Redux **unless** already structured as hooks in `src/hooks`. |
| **Limitations / notes** | Display times vs UTC: align with backend contract; document if APIs return ISO strings only. |

#### 2.7 Types

| | |
|--|--|
| **Responsibility** | **`src/types/**`**: shared contracts (`auth.types`, `assessment.types`, `me.types`, `notification`, `customer-documents.types`, `employee-recovery-stats.types`, `loan-application-reschedule.types`). Domain types also appear next to features (e.g. table-row props). |
| **Entry points** | Import with `import type` from features and services. |
| **Dependencies** | Types should not import runtime code; avoid circular type-only cycles with components. |
| **Limitations / notes** | API responses often need **normalization** in views/services — document snake_case vs camelCase at service layer when stabilizing APIs. |

#### 2.8 Bank admin sections

| | |
|--|--|
| **Responsibility** | **`src/sections/Bankadmin/**`**: borrower, loan application (incl. reschedule), recovery, payment, credit rating, credit proposal report, assessment, employee, MIS report, settings, etc. Heavy CRUD and tables. |
| **Entry points** | **`src/pages/admin/*.tsx`** → lazy imports from `sections/Bankadmin/.../view` or `view/index`. |
| **Dependencies** | Sections use **`redux/services`** (bank-admin, loan-applications, …), **`src/components`**, **`src/types`**. Avoid importing Superadmin or customer-only sections. |
| **Limitations / notes** | Several views are **large** (e.g. recovery, loan application) — candidates for splitting (Phase 3.4). Some filters/tabs are **commented** pending product (document when re-enabling). |

#### 2.9 Customer sections

| | |
|--|--|
| **Responsibility** | **`src/sections/customer/**`**: apply-loan flow, profile, documents, installments, assessment, payoff-offer, credit-rating, etc. |
| **Entry points** | **`src/pages/customer/*.tsx`**, plus shared **`src/pages/profile.tsx`** for `/profile`. |
| **Dependencies** | **`customer.services`**, **`loan-applications`**, feature types (`customer-documents.types`, …). |
| **Limitations / notes** | Uploads must match **backend allowed types** (see documents view). Multi-step loan flow: keep step state and API errors explicit for users. |

#### 2.10 Employee sections

| | |
|--|--|
| **Responsibility** | **`src/sections/Employee/**`**: recovery officer dashboards, **my cases**, **recovery stats** (paths use capital **`Employee`**). |
| **Entry points** | **`src/pages/employee/*.tsx`** (e.g. `recovery-dashboard`, `recovery-stats`). |
| **Dependencies** | **`redux/services/employee`**, **`employee-recovery-stats.types`**. |
| **Limitations / notes** | Align date filters with API (UTC vs local). Pagination/search same caveats as other list views. |

#### 2.11 Other sections (Superadmin, users, auth views, portfolio, overview)

| | |
|--|--|
| **Responsibility** | **`Superadmin/`**: bank CRUD, subscriptions/payments, system user UI. **`sections/auth/`**: sign-in variants, register, OTP, forgot password. **`portfolio/`**: portfolio overview (KPIs, bank admin stats). **`overview/`**: dashboard analytics widgets. **`users/`**: admin user management forms/tables. **`error/`**: 404-style views. |
| **Entry points** | Superadmin: `src/pages/super-admin/*`. Auth: `src/pages/auth/*`. Portfolio: usually home **`/`** for bank admin via dashboard page composition. |
| **Dependencies** | Superadmin services vs bank-admin — keep API boundaries clear (platform vs tenant). |
| **Limitations / notes** | **`portfolio-overview-view.tsx`** is large and aggregates multiple APIs; treat as integration point for loading/error states. |

#### 2.12 Pages (thin wrappers)

| | |
|--|--|
| **Responsibility** | **`src/pages/**`** (~53 files): mostly **one export** that renders a section view. Lazy-loaded from `routes/sections.tsx`. |
| **Entry points** | Router path → `pages/...` → section `*View`. |
| **Dependencies** | Pages should only **compose** sections + SEO/helmet if any; avoid business logic in pages. |
| **Limitations / notes** | Naming: `admin/` = bank admin, `super-admin/` = platform admin, `customer/`, `employee/`, `auth/`. When adding a route, add lazy import in **`sections.tsx`** and the matching route file. |

---

## Security & performance program

This section tracks **hardening and speed** work that spans the whole app. Revisit when adding features or new dependencies.

### Security (current posture + follow-ups)

| Topic | Status / notes |
|--------|----------------|
| **Secrets in client** | Only `VITE_*` variables are exposed in the bundle. Never put API secrets in frontend code; use backend-issued tokens only. |
| **Tokens** | Access/refresh tokens live in **localStorage** via `src/utils/auth-storage.ts` — standard for SPAs but **vulnerable to XSS**. Mitigate with strict CSP, sanitizing any HTML, and preferring **HttpOnly cookies** for tokens if the API supports it later. |
| **`VITE_BYPASS_AUTH`** | Defined in `src/config/environment.ts` — **must not** be enabled in production; not wired into `ProtectedRoute` today (verify if ever used). |
| **Guards** | `ProtectedRoute`, `MultiRoleGuard`, `SubscriptionGuard` enforce access; removed stray **`console.log(user)`** from `RoleGuard` (was leaking user object to console). |
| **Debug logging** | Use **`devLog` / `devWarn` / `devError`** from `src/utils/logger.ts` instead of raw `console.log`/`warn` for noisy output — **no-ops in production** (`import.meta.env.DEV`). Legitimate failures may still use `console.error` where needed. |
| **API errors** | Global 401/403 handling in `http-common.tsx` uses `devWarn` so production consoles are not spammed on every auth edge case. |

### Performance (current posture + follow-ups)

| Topic | Status / notes |
|--------|----------------|
| **Code splitting** | Routes use **`React.lazy`** in `routes/sections.tsx`. **Vite** `build.rollupOptions.output.manualChunks` splits **`mui`**, **`react-vendor`**, **`redux`**, **`socket-io`** for better long-term caching. |
| **Heavy views** | Large section views (e.g. recovery, portfolio) — prefer **`useMemo`**, stable callbacks, and splitting subcomponents when profiling shows jank (Phase 3.4). |
| **Lists** | Server-side pagination/search where implemented; keep **`useDebounce`** for search fields to reduce API churn. |
| **Icons** | `Iconify` offline warnings use **`devWarn`** — avoids console spam in production when an icon is not in the registered set. |
| **Profiling** | Use Chrome Performance + React DevTools Profiler on slow screens; optional: `rollup-plugin-visualizer` to inspect bundle composition. |

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
| 2026-04-14 | Phase 2 repository map reviewed; module audit snapshot added (`src/auth` → `components/auth` noted). |
| 2026-04-14 | Security & performance program: `logger.ts`, production-safe logging, Vite manual chunks, doc section. |
