Internal Admin Dashboard for Opero SaaS Platform. Used by Platform Super Admins, Support, and Billing staff to manage tenants, platform users, and global system configurations.

---

## 🚀 Tech Stack & Core Guidelines

- **Framework**: Angular 18+ (Standalone Components by default, Signals for state management).
- **GraphQL Client**: `@apollo/client` or `apollo-angular` connecting to Opero Backend GraphQL API.
- **Styling**: Tailwind CSS + Spartan UI (terse, accessible, clean design).
- **State Management**: Angular Signals + RxJS (for async GraphQL data streams).
- **Form Handling**: Reactive Forms with strict validation.

---

## 🔐 Auth & Platform User Context

Opero Backend supports two authentication types:
1. `TENANT` — Store owners/staff (isolated per tenant).
2. `PLATFORM` — Internal platform staff (`SUPER_ADMIN`, `SUPPORT`, `BILLING`).

### Platform Auth Requirements:
- **Login**: Uses same GraphQL `login` mutation (`email`, `password`). Login without `subdomain` defaults to Platform User check first.
- **JWT Claims**: Platform token contains `authType = "PLATFORM"` and `isSuperuser = true`.
- **Headers**: Send `Authorization: Bearer <token>` on every request. **DO NOT** send `x-tenant-id` header for platform operations.
- **Access Control**:
  - `SUPER_ADMIN`: Full access (Tenant CRUD, Platform User CRUD, Domain Management).
  - `SUPPORT`: View tenants, reset user passwords, inspect audit logs (Read-Only).
  - `BILLING`: Manage tenant subscriptions, limits, and invoicing.

---

## 📐 Project Structure Guidelines
src/
├── app/
│   ├── core/
│   │   ├── auth/            # AuthService, AuthGuard, PlatformRoleGuard, AuthGql
│   │   ├── graphql/         # Apollo client config, link interceptors
│   │   └── models/          # Core TypeScript interfaces
│   │       ├── input/       # GraphQL input types (auth.input.ts, ...)
│   │       └── model/       # Entity models (user.model.ts, ...)
│   ├── pages/               # Route-level standalone pages (view layer)
│   │   ├── auth/            # Login page
│   │   ├── tenants/         # Tenant list, detail, create-tenant wizard
│   │   ├── platform-users/  # SuperAdmin / Staff user management
│   │   ├── audit-logs/      # System-wide audit log viewer
│   │   └── health/          # Backend system health monitor
│   ├── features/            # Feature logic: feature-scoped GQL services, state, stores
│   ├── lib/                 # Framework-agnostic shared infrastructure
│   │   └── graphql/         # typed-graphqlify wrapper (base GraphQL class, apollo singleton)
│   └── shared/              # Reusable UI components, pipes, directives
│       ├── components/      # Modal, Table, Toast, Badge, PageHeader
│       └── utils/           # Helper functions, error formatters

### Path Aliases
- `@lib/*` → `src/app/lib/*` — framework-agnostic infra (graphql wrapper, error helper)
- `@res/*` → `src/app/core/models/*` — `@res/input/*` GraphQL inputs, `@res/model/*` entity models

### GraphQL Usage Pattern
- Build operations with `typed-graphqlify` (`mutation`/`query`/`params`/`rawString`/`types`).
- Extend base `GraphQL` class (`@lib/graphql/graphql`) per feature, e.g. `AuthGql extends GraphQL`.
- Base class handles Apollo client, gql tagging, and `ErrorHelper` parsing.


---

## 🔌 GraphQL Integration & API Endpoints

- **GraphQL Endpoint**: `http://localhost:3001/graphql` (or `ENVIRONMENT_API_URL`).
- **Error Handling Protocol**:
  - Opero BE returns GraphQLError extensions with `code` field (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`).
  - Read `error.graphQLErrors[0].extensions.code` in Apollo Link Error Interceptor.
  - Automatically redirect to `/login` on `UNAUTHORIZED`.
  - Display user-friendly Toast on `FORBIDDEN` or validation errors.

### Key Platform Queries & Mutations (NestJS BE):
```graphql
# Auth
mutation Login($input: LoginInput!) {
  login(loginInput: $input) {
    accessToken
    user {
      id
      email
      fullName
      role
      authType
      isSuperuser
    }
  }
}

# Tenant Management
query Tenants {
  tenants {
    id
    name
    subdomain
    createdAt
    updatedAt
  }
}

mutation CreateTenantWithOwner($input: CreateTenantWithOwnerInput!) {
  createTenantWithOwner(input: $input) {
    tenant { id name subdomain }
    owner { id email fullName }
  }
}
🎨 Code Style Rules for AI Agents
Standalone Components: Always use standalone: true. Do NOT create NgModules unless strictly necessary.
Signals First: Prefer signal(), computed(), and effect() over RxJS BehaviorSubject for local component state.
Control Flow Syntax: Use native @if, @for, @switch instead of *ngIf, *ngFor.
No Any Type: Enforce strict TypeScript typing everywhere. Generate GraphQL types via graphql-codegen if available.
Form Validation: Clean error messages on blur, disable submit button when form is invalid.
Responsive Layout: Sidebar + Header layout, optimized for desktop (1280px+).
### Node Version
- Use Node **22** (`nvm use 22`). pnpm 11 requires Node ≥ 22.13 (node:sqlite); Node 20 breaks pnpm commands.

🛠 Command Shortcuts
pnpm start           # Run dev server (http://localhost:4200)
pnpm build           # Production build
pnpm lint            # ESLint check
pnpm test            # Run unit tests
pnpm generate:types  # Generate TypeScript types from GraphQL schema
