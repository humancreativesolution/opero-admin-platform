export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export const TENANT_STATUSES: readonly TenantStatus[] = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'];

export type TenantUserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'PURCHASING' | 'WAREHOUSE' | 'CASHIER';

export const TENANT_USER_ROLES: readonly TenantUserRole[] = [
  'OWNER',
  'ADMIN',
  'MANAGER',
  'PURCHASING',
  'WAREHOUSE',
  'CASHIER',
];

export interface Tenant {
  id: string;
  name: string;
  subdomain: string | null;
  domains: string[];
  status: TenantStatus;
  statusReason: string | null;
  statusChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: string | null;
}
