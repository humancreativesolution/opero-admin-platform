import { Injectable } from '@angular/core';
import { GraphQL } from '@lib/graphql/graphql';
import type {
  AddTenantUserInput,
  CreateTenantWithOwnerInput,
  Paginated,
  Tenant,
  TenantFilterInput,
  TenantStatus,
  TenantUser,
  UpdateTenantInput,
  UpdateTenantStatusInput,
} from '@res/index';
import { mutation, params, query, types } from 'typed-graphqlify';

const tenantFields = {
  id: types.string,
  name: types.string,
  subdomain: types.custom<string | null>(),
  domains: [types.string],
  status: types.custom<TenantStatus>(),
  statusReason: types.custom<string | null>(),
  statusChangedAt: types.custom<string | null>(),
  createdAt: types.string,
  updatedAt: types.string,
};

const tenantUserFields = {
  id: types.string,
  tenantId: types.string,
  email: types.string,
  fullName: types.string,
  role: types.custom<string | null>(),
};

const metaFields = {
  page: types.number,
  limit: types.number,
  totalCount: types.number,
  totalPages: types.number,
  hasNextPage: types.boolean,
  hasPrevPage: types.boolean,
};

@Injectable({ providedIn: 'root' })
export class TenantsGql extends GraphQL {
  async list(page: number, limit: number, filter: TenantFilterInput): Promise<Paginated<Tenant>> {
    const gql = query('Tenants($page: Int!, $limit: Int!, $filter: TenantFilterInput)', {
      tenants: params(
        { page: '$page', limit: '$limit', filter: '$filter' },
        { data: [tenantFields], meta: metaFields },
      ),
    });

    const result = await this.query<typeof gql.data>(gql.toString(), {
      variables: { page, limit, filter },
      fetchPolicy: 'network-only',
    });

    return this.required(result.data).tenants;
  }

  async createWithOwner(
    input: CreateTenantWithOwnerInput,
  ): Promise<{ tenant: Tenant; owner: TenantUser }> {
    const gql = mutation('CreateTenantWithOwner($input: CreateTenantWithOwnerInput!)', {
      createTenantWithOwner: params(
        { input: '$input' },
        { tenant: tenantFields, owner: tenantUserFields },
      ),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
    return this.required(result.data).createTenantWithOwner;
  }

  async update(input: UpdateTenantInput): Promise<Tenant> {
    const gql = mutation('UpdateTenant($input: UpdateTenantInput!)', {
      updateTenant: params({ updateTenantInput: '$input' }, tenantFields),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
    return this.required(result.data).updateTenant;
  }

  async updateStatus(input: UpdateTenantStatusInput): Promise<Tenant> {
    const gql = mutation('UpdateTenantStatus($input: UpdateTenantStatusInput!)', {
      updateTenantStatus: params({ input: '$input' }, tenantFields),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
    return this.required(result.data).updateTenantStatus;
  }

  /** Tambah user (mis. owner baru) ke tenant yang sudah ada. */
  async addUser(input: AddTenantUserInput): Promise<TenantUser> {
    const gql = mutation('RegisterTenantUser($input: RegisterInput!)', {
      register: params({ registerInput: '$input' }, tenantUserFields),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
    return this.required(result.data).register;
  }

  private required<T>(data: T | null | undefined): T {
    if (!data) throw new Error('Empty response from server');
    return data;
  }
}
