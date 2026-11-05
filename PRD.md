# PRD — Opero Admin Tool (Internal Admin Dashboard)

## 1. Overview

Internal web dashboard for the Opero SaaS platform. Used by Platform staff to manage tenants, platform users, and global system configuration.

### Goals
- Single access point for all platform-level operations.
- Role-based access: `SUPER_ADMIN`, `SUPPORT`, `BILLING`.
- Reliable GraphQL integration with clean, consistent error handling.

### Non-Goals
- Tenant-facing UI (handled by tenant frontend).
- Payment processing / actual invoicing (BILLING manages subscription state only).
- Mobile-first design (desktop 1280px+).

---

## 2. Personas & Roles

| Role | Access Level | Capabilities |
|---|---|---|
| `SUPER_ADMIN` | Full | Tenant CRUD, Platform User CRUD, Domain management |
| `SUPPORT` | Read-only | View tenants, reset user passwords, inspect audit logs |
| `BILLING` | Write-scoped | Manage subscriptions, limits, invoicing |

Auth type: `PLATFORM` (JWT claims `authType = "PLATFORM"`, `isSuperuser = true`).

---

## 3. Functional Requirements

### FR-1 Authentication
- Login via GraphQL `login` mutation (email + password), no `subdomain`.
- Persist JWT; attach `Authorization: Bearer <token>` on every request.
- **Never** send `x-tenant-id` header for platform operations.
- Auto-logout / redirect to `/login` on `UNAUTHORIZED`.
- Guard protected routes by role (`PlatformRoleGuard`).

### FR-2 Tenant Management (`SUPER_ADMIN`, `SUPPORT` read)
- List tenants with name, subdomain, timestamps.
- View tenant detail.
- Create tenant with owner (`createTenantWithOwner`).
- Edit / delete tenant (`SUPER_ADMIN` only).

### FR-3 Platform User Management (`SUPER_ADMIN`)
- CRUD platform staff users (SuperAdmins, Support, Billing staff).
- Assign/change roles.
- Reset passwords (`SUPPORT` can reset too).

### FR-4 Audit Logs (`SUPER_ADMIN`, `SUPPORT` read)
- System-wide audit log viewer with filters (actor, action, date, tenant).

### FR-5 Subscription & Billing (`BILLING`)
- View tenant subscription/plan state.
- Update subscription status, limits.

### FR-6 System Health (`SUPER_ADMIN`)
- Backend health monitor: endpoint status, GraphQL reachability, latency.

---

## 4. Non-Functional Requirements

| Aspect | Requirement |
|---|---|
| Framework | Angular 18+ standalone components, Angular Signals + RxJS |
| Styling | Tailwind CSS + Spartan UI, accessible, clean |
| Typing | Strict TS, `no any`, types generated via `graphql-codegen` |
| Error handling | Read `graphQLErrors[0].extensions.code`; toast on `FORBIDDEN`/validation; redirect on `UNAUTHORIZED` |
| Forms | Reactive forms, error on blur, submit disabled when invalid |
| API | GraphQL at `http://localhost:3001/graphql` (or `ENVIRONMENT_API_URL`) |

---

## 5. Acceptance Criteria (sample)

1. Support user logs in → sees tenants list, read-only (no create/edit/delete).
2. SuperAdmin creates tenant with owner → tenant appears in list.
3. Unauthenticated API call → auto-redirect to `/login`.
4. Billing user sees subscription panel; Support sees audit logs.
5. Invalid form → submit disabled, clean error messages on blur.
