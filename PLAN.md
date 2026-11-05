# Implementation Plan — Opero Admin Tool

## Phase 0: Foundation (Milestone A)

1. **Scaffold Core** — `app.config.ts` providers, routing skeleton, base layout (Sidebar + Header).
2. **Apollo GraphQL Setup** (`core/graphql/`)
   - `apollo.provider.ts` — `APOLLO_OPTIONS` with `HttpLink` to `ENVIRONMENT_API_URL`.
   - `error.interceptor.ts` — read `graphQLErrors[0].extensions.code`; redirect on `UNAUTHORIZED`; toast on `FORBIDDEN`/`BAD_REQUEST`/`CONFLICT`.
   - `auth.interceptor.ts` — attach `Authorization: Bearer <token>`.
3. **Auth Core** (`core/auth/`)
   - `AuthService` — login mutation, token store (localStorage), decoded claims (`authType`, `isSuperuser`, `role`).
   - `AuthGuard` — redirect to `/login` if no valid token.
   - `PlatformRoleGuard` — block by `role`.
4. **GraphQL Codegen** — write `.graphql` operation files; run `pnpm generate:types`; commit generated types.

### Exit criteria
- `pnpm start` runs; `/login` renders; protected route redirects when unauthenticated.

---

## Phase 1: Shared UI + Login (Milestone B)

1. **Shared Components** (`shared/components/`)
   - `Modal`, `Table`, `Toast`, `Badge`, `PageHeader` — Tailwind + Spartan UI, accessible.
   - `ToastService` + global toast host.
2. **Login Page** (`features/auth/login`)
   - Reactive form (email, password), validation on blur, disabled submit when invalid.
   - Login mutation; store token; role-based redirect to landing route.

### Exit criteria
- Support / SuperAdmin / Billing each land on correct home route; bad credentials → toast with error code.

---

## Phase 2: Tenants (Milestone C)

1. **Tenant List** — `query Tenants`; table with name, subdomain, dates; search/filter.
2. **Tenant Detail** — info, owner, subscription state.
3. **Create Tenant Wizard** — `createTenantWithOwner`; multi-step form; disabled submit while invalid/pending.
4. **Delete/Edit** — `SUPER_ADMIN` only; confirm modal.

### Exit criteria
- Full tenant CRUD flow works for SuperAdmin; Support is read-only.

---

## Phase 3: Platform Users (Milestone D)

1. **User List** — staff users table; role badges.
2. **Create/Edit User** — assign role.
3. **Reset Password** — `SUPER_ADMIN` + `SUPPORT`.

### Exit criteria
- SuperAdmin manages staff; Support resets passwords only.

---

## Phase 4: Audit Logs + Billing + Health (Milestone E)

1. **Audit Logs** (`features/audit-logs`) — viewer with filters (actor, action, tenant, date).
2. **Billing** (`features/billing`) — subscription view + status/limits update (`BILLING`).
3. **Health** (`features/health`) — backend status dashboard (`SUPER_ADMIN`).

### Exit criteria
- All three features render and consume backend data correctly.

---

## Phase 5: Hardening (Milestone F)

1. Lint + strict TS pass; `pnpm lint`, `pnpm build`.
2. Error-path audit: every GraphQL error code handled consistently.
3. Unit tests for guards, error interceptor, auth service.
4. Docs + env templates.

### Exit criteria
- `pnpm lint` clean, `pnpm build` passes, key specs green.

---

## Deliverable Order (short)
1. Apollo provider + auth core + guards
2. Login + layout + shared components
3. Tenants (list → create → detail)
4. Platform users
5. Audit logs / billing / health
6. Hardening + tests
