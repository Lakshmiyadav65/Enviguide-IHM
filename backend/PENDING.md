# IHM EnviGuide — Backend: Pending Work & Status

> Audit date: 2026-06-12 · Scope: `backend/` only · Based on a full read of `src/`, the SQL
> migration, routes wiring, and the checked-in error logs.

The backend is an Express + TypeScript (ESM, run via `tsx`) REST API over **raw PostgreSQL**
(`pg`), not Prisma. It boots, most CRUD modules are real and wired, but several areas are
stubbed, one whole feature is built-but-disconnected, and there's leftover cruft from an
earlier Prisma-based version. Items below are grouped by priority.

---

## Module status at a glance

| Area | Route prefix | State | Notes |
|---|---|---|---|
| Auth (login/JWT) | `/auth` | ✅ Real | bcrypt + JWT, 7-day token |
| Vessels | `/vessels` | ✅ Real | full CRUD + image upload |
| Decks / GA Plans / Deck Areas | nested under `/vessels` | ✅ Real | |
| Materials | `/vessels/:id/materials` | ✅ Real | |
| Documents / MD-SDoC | nested under `/vessels` | ✅ Real | |
| Purchase Orders | `/purchase-orders` | ✅ Real | incl. Excel line-item upload |
| Audits | `/audits` | 🟡 Mostly real | `getMdsDocAudit` is a stand-in (see P2) |
| Suppliers / Equipment / Suspected Keywords | `/suppliers`, `/equipment`, `/suspected-keywords` | ✅ Real | |
| Users / Categories / Permissions / Menu | `/users`, `/user-categories`, `/permissions`, `/menu` | ✅ Real | |
| Contact | `/contact` | ✅ Real | |
| Public supplier portal | `/public` | ✅ Real | |
| **Reports** | *(unmounted)* | 🔴 Built, not wired | full impl exists, no route mounts it (see P0-3) |
| **Dashboard** | `/dashboard` | 🔴 Stub | returns all-zero metrics + empty alerts |
| **`/security`** | `/security` | 🔴 Stub / duplicate | 13 handlers all return fake data; superseded by `/users` etc. |
| **`/master`** | `/master` | 🔴 Stub / duplicate | all handlers echo input; superseded by `/suppliers` etc. |
| Certificates | `/vessels/:id/certificates` | 🔴 Placeholder | no `certificates` table exists yet |

---

## P0 — Blockers / highest impact

### P0-1. Remove the dead Prisma layer
The project migrated from Prisma to raw `pg`, but the Prisma artifacts are still in the repo and
actively error out:
- [prisma/schema.prisma](prisma/schema.prisma) is orphaned. `pg`/`tsx` never read it; `package.json`
  has no `prisma` dependency or script. Running Prisma against it fails with `P1012`
  (`datasource url no longer supported`, Prisma 7.5.0) — see [prisma_output.txt](prisma_output.txt).
- The checked-in error logs ([dev_error.txt](dev_error.txt), [errors.txt](errors.txt),
  [errors_v2.txt](errors_v2.txt), [typescript_errors.txt](typescript_errors.txt)) reference
  `src/index.ts` and `src/config/prisma.ts` — **files that no longer exist**. They are stale and misleading.

**Action:** delete `prisma/`, delete the `*error*.txt` / `prisma_output.txt` logs, and add them to
`.gitignore`. Decide explicitly: schema-of-record is [src/db/migrate.ts](src/db/migrate.ts) (raw SQL),
*not* Prisma. (If Prisma is ever wanted back, that's a separate, deliberate decision — today it's just noise.)

### P0-2. Decide the fate of `/security` and `/master` (stub duplicates)
Both route trees are wired in [routes.ts](src/routes/routes.ts#L38-L39) but their controllers are 100% fake:
- [security.controller.ts](src/controller/security.controller.ts) — all 13 handlers return `data: []`
  or echo `req.body`. The **real** versions of these already exist and are mounted separately:
  `/users` ([user.controller](src/controller/user.controller.ts)), `/user-categories`,
  `/permissions`, `/menu`.
- [master.controller.ts](src/controller/master.controller.ts) — same pattern. Real versions exist at
  `/suppliers`, `/equipment`, `/suspected-keywords`.

**Action:** either **delete** `security.*` + `master.*` (controllers + routes + the two `router.use`
lines) and point the frontend at the real endpoints, **or**, if the frontend still calls `/security`
and `/master`, re-point those handlers to the real services. Right now any client hitting them gets
silent empty/echoed data — a real bug magnet. *Exception to check first:* `master.listRegistered`,
`master.listOwnership`, `master.updateOwnership` may have **no** real equivalent — confirm whether
"registered companies" / "ownership" master-data is a needed feature before deleting those.

### P0-3. Wire up the Reports feature (built but unreachable)
A complete reporting subsystem exists and is never mounted:
- [report.controller.ts](src/controller/report.controller.ts), [report.service.ts](src/services/report.service.ts),
  [reports/data.ts](src/services/reports/data.ts) (718 lines), [reports/renderer.ts](src/services/reports/renderer.ts),
  and 4 templates including [quarterly-compliance.ts](src/services/reports/templates/quarterly-compliance.ts) (1098 lines).
- [report.routes.ts](src/routes/subRoutes/report.routes.ts) is meant to mount under
  `/vessels/:vesselId/reports`, but **nothing imports it** — `vessel.routes.ts` mounts gaPlan/deck/
  material/document/mdsdoc routers but not the report router.

**Action:** import and mount `reportRouter` in [vessel.routes.ts](src/routes/subRoutes/vessel.routes.ts)
(`router.use('/:vesselId/reports', reportRouter)`), then smoke-test list/download/timeline/file
endpoints. Verify the PDF renderer's runtime dependency (the `renderer` likely needs a headless-Chrome
/ HTML-to-PDF engine — confirm it's installed and works on the target host).

---

## P1 — Unimplemented endpoints (return fake data today)

### P1-1. Dashboard is entirely stubbed
[dashboard.controller.ts](src/controller/dashboard.controller.ts):
- `getDashboardStats` (line 6, `// TODO: aggregate from DB`) returns hard-zero users/PO/vessel metrics.
- `getSocAlerts` (line 20, `// TODO`) returns `[]`.

**Action:** write the aggregation queries — new registrations / IHM registrations / inactive users,
PO line-item totals + pending/received MDs + HM red/green counts, vessels onboarded / items moved /
**SOC expired**. SOC alerts need an expiry source (see P1-3).

### P1-2. Vessel materials/certificates placeholders
[vessel.controller.ts](src/controller/vessel.controller.ts#L158-L165):
- `getVesselMaterials` returns `[]` — but materials are actually served by the real nested
  `/vessels/:id/materials` router, so this handler is likely **redundant**; remove it or make it
  delegate to the materials service.
- `getVesselCertificates` returns `[]` — genuinely unimplemented (see P1-3).

### P1-3. Certificates: permissions exist, data model doesn't
The permission catalog seeds a full `mod_certificate` module with create/read/update/print/export/send
actions ([migrate.ts](src/db/migrate.ts#L329-L392)), and the Vessel carries `soc_reference` /
`soc_expiry_date` columns — but there is **no `certificates` table**. So `getVesselCertificates` and the
Dashboard "SOC expired" metric have nothing to read.

**Action:** decide the model — either (a) drive SOC purely off the vessel's `soc_expiry_date`
(quick win, unblocks the dashboard alert + cert list), or (b) add a proper `certificates` table
(IHM/SOC certs with issue/expiry/issuer/file) and a CRUD module to match the seeded permissions.

---

## P2 — Partial / "good enough for now" implementations

### P2-1. `getMdsDocAudit` is a placeholder query
[audit.controller.ts:117-123](src/controller/audit.controller.ts#L117-L123) returns **all** audits
(`// For now, use audits with hazmat materials pending - real query joins materials with category=hazard`)
instead of filtering to suspected-hazardous items still missing an MD/SDoC.
**Action:** implement the real join (`materials` where `category = 'hazard'` and MD/SDoC pending).

---

## P3 — Auth / RBAC hardening

### P3-1. Role taxonomy mismatch
- The JWT carries `role = user.category` ([auth.service.ts:45](src/services/auth.service.ts#L45)), and
  `category` is free-form (seed only ever creates `admin`; the schema default is `viewer`).
- The middleware guard `authorize('admin','manager','viewer')`
  ([auth.middleware.ts:42-49](src/middleware/auth.middleware.ts#L42-L49)) hardcodes three roles.
  `manager` is never minted, so e.g. `authorize('admin','manager')` is effectively admin-only, and any
  custom category created via `/user-categories` won't map onto these three buckets.

### P3-2. Granular permissions aren't enforced at the route layer
There's a real permissions/menu/role-rights system (DB tables + `/permissions`, `/menu`,
`/user-categories` controllers), but **route guards never consult it** — they use only the coarse
`authorize(role)` check. The per-user / per-role "rights" the UI manages don't actually gate API calls.
**Action:** add a permission-checking middleware that resolves the caller's category → allowed
actions and guards write endpoints with it.

### P3-3. Other auth gaps
- No rate limiting on `/auth/login` (brute-force exposure).
- No refresh tokens / logout / revocation — a leaked 7-day JWT is valid until expiry.
- `helmet()` is used with defaults only; no explicit CSP/CORS hardening beyond the origin allowlist.

---

## P4 — Cross-cutting / hygiene

- **No tests anywhere.** No `test` script, no `*.test.ts` / `*.spec.ts`. Add Vitest/Jest + supertest,
  starting with auth and the audit/PO upload flows.
- **`zod` is a dependency but unused** (0 imports). Validation is ad-hoc `if (!data.x) throw new Error(...)`
  scattered across services. Standardize request validation on zod schemas (also gives consistent 400s).
- **Email** ([email.service.ts](src/services/email.service.ts)) falls back to stdout logging unless
  `BREVO_API_KEY` / `RESEND_API_KEY` / SMTP is set — fine for dev, **must be configured for prod**.
- **File storage** is local-disk + `/uploads/*` unless the four `S3_*` vars are set; uploads are
  **ephemeral** on cloud hosts (Render free tier, etc.). Configure S3-compatible storage for prod.
- **Source-comment mojibake**: controller header banners contain corrupted box-drawing characters
  (`â"€â"€…` instead of `──`). Cosmetic; re-save those files as clean UTF-8 when touched.
- **`.env`**: ensure `JWT_SECRET` is a strong random value in every real environment (the example ships
  a placeholder), and confirm `CORS_ORIGIN` lists the real frontend origin(s).

---

## Suggested order of attack

1. **Cleanup (fast, low-risk):** P0-1 (delete Prisma + stale logs), P1-2 redundant handler.
2. **Reconnect what's already built:** P0-3 (mount Reports), P0-2 (resolve `/security` + `/master`).
3. **Fill the real gaps:** P1-1 (Dashboard queries), P1-3 (certificates/SOC model), P2-1 (MD/SDoC audit query).
4. **Harden:** P3-1/P3-2 (RBAC), P3-3 (rate-limit/refresh), P4 (tests, zod, prod email/storage config).

## Quick wins (≤ ~1 hr each)
- Mount the report router (P0-3) — one import + one `router.use` line, unlocks a large finished feature.
- Delete `prisma/` + `*error*.txt` and `.gitignore` them (P0-1).
- Drive `getVesselCertificates` + Dashboard SOC alert off `vessels.soc_expiry_date` (P1-3 option a).
- Remove the redundant `getVesselMaterials` placeholder (P1-2).
