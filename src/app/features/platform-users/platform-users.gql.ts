import { Injectable } from '@angular/core';
import { GraphQL } from '@lib/graphql/graphql';
import type {
  ChangeMyPlatformPasswordInput,
  CreatePlatformUserInput,
  Paginated,
  PlatformRole,
  PlatformUser,
  PlatformUserFilterInput,
  ResetPlatformUserPasswordInput,
  UpdatePlatformUserInput,
} from '@res/index';
import { mutation, params, query, types } from 'typed-graphqlify';

const platformUserFields = {
  id: types.string,
  email: types.string,
  fullName: types.string,
  role: types.custom<PlatformRole>(),
  isActive: types.boolean,
  lastLoginAt: types.custom<string | null>(),
  passwordChangedAt: types.custom<string | null>(),
  createdAt: types.string,
  updatedAt: types.string,
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
export class PlatformUsersGql extends GraphQL {
  async list(
    page: number,
    limit: number,
    filter: PlatformUserFilterInput,
  ): Promise<Paginated<PlatformUser>> {
    const gql = query(
      'PlatformUsers($page: Int!, $limit: Int!, $filter: PlatformUserFilterInput)',
      {
        platformUsers: params(
          { page: '$page', limit: '$limit', filter: '$filter' },
          { data: [platformUserFields], meta: metaFields },
        ),
      },
    );

    const result = await this.query<typeof gql.data>(gql.toString(), {
      variables: { page, limit, filter },
      fetchPolicy: 'network-only',
    });

    return this.required(result.data).platformUsers;
  }

  async create(input: CreatePlatformUserInput): Promise<PlatformUser> {
    const gql = mutation('CreatePlatformUser($input: CreatePlatformUserInput!)', {
      createPlatformUser: params({ input: '$input' }, platformUserFields),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
    return this.required(result.data).createPlatformUser;
  }

  async update(input: UpdatePlatformUserInput): Promise<PlatformUser> {
    const gql = mutation('UpdatePlatformUser($input: UpdatePlatformUserInput!)', {
      updatePlatformUser: params({ input: '$input' }, platformUserFields),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
    return this.required(result.data).updatePlatformUser;
  }

  async resetPassword(input: ResetPlatformUserPasswordInput): Promise<PlatformUser> {
    const gql = mutation('ResetPlatformUserPassword($input: ResetPlatformUserPasswordInput!)', {
      resetPlatformUserPassword: params({ input: '$input' }, platformUserFields),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
    return this.required(result.data).resetPlatformUserPassword;
  }

  async changeMyPassword(input: ChangeMyPlatformPasswordInput): Promise<void> {
    const gql = mutation('ChangeMyPlatformPassword($input: ChangeMyPlatformPasswordInput!)', {
      changeMyPlatformPassword: params({ input: '$input' }, { id: types.string }),
    });

    await this.mutate<typeof gql.data>(gql.toString(), { variables: { input } });
  }

  private required<T>(data: T | null | undefined): T {
    if (!data) throw new Error('Empty response from server');
    return data;
  }
}
