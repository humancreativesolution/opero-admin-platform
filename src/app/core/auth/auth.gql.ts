import { Injectable } from '@angular/core';
import { GraphQL } from '@lib/graphql/graphql';
import { LoginInput } from '@res/input/auth.input';
import { AuthResponse } from '@res/model/user.model';
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
            role: types.string,
            authType: types.string,
            isSuperuser: types.boolean,
          },
        }
      ),
    });

    console.log('[AuthGql] generated mutation query string:', gql.toString());
    const result = await this.mutate<typeof gql.data>(gql.toString());
    console.log('[AuthGql] mutate result:', result);
    return (result.data as any).login;
  }
}
