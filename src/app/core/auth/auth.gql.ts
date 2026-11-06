import { Injectable } from '@angular/core';
import { GraphQL } from '@lib/graphql/graphql';
import { LoginInput } from '@res/input/auth.input';
import { AuthResponse, User } from '@res/model/user.model';
import { mutation, params, rawString, types } from 'typed-graphqlify';

@Injectable({ providedIn: 'root' })
export class AuthGql extends GraphQL {
  async login(data: LoginInput): Promise<AuthResponse> {
    const gql = mutation({
      login: params(
        {
          loginInput: {
            email: rawString(data.email),
            password: rawString(data.password),
          },
        },
        {
          accessToken: types.string,
          user: {
            id: types.string,
            email: types.string,
            fullName: types.string,
            role: types.custom<User['role']>(),
            authType: types.custom<User['authType']>(),
            isSuperuser: types.boolean,
          },
        },
      ),
    });

    const result = await this.mutate<typeof gql.data>(gql.toString());

    if (!result.data) {
      throw new Error('Login response is empty');
    }

    return result.data.login;
  }
}
