import type { TenantStatus, TenantUserRole } from '../model/tenant.model';

export interface TenantFilterInput {
  search?: string;
  status?: TenantStatus;
}

export interface CreateTenantWithOwnerInput {
  tenantName: string;
  subdomain: string;
  domains?: string[];
  ownerEmail: string;
  ownerFullName: string;
  ownerPassword: string;
}

export interface UpdateTenantInput {
  id: string;
  name?: string;
  subdomain?: string;
  domains?: string[];
}

export interface UpdateTenantStatusInput {
  id: string;
  status: TenantStatus;
  reason?: string;
}

export interface AddTenantUserInput {
  tenantId: string;
  email: string;
  fullName: string;
  password: string;
  role: TenantUserRole;
}
