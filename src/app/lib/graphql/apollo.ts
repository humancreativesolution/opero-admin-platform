import { CombinedGraphQLErrors } from '@apollo/client';
import type {
  ApolloQueryResult,
  DefaultContext,
  FetchResult,
  MutationOptions,
  OperationVariables,
  QueryOptions,
} from '@apollo/client/core';
import { ApolloClient, ApolloLink, createHttpLink, gql, InMemoryCache } from '@apollo/client/core';
import { ErrorLink } from '@apollo/client/link/error';
import { UNAUTHENTICATED } from './error';

const GRAPHQL_URL = '/graphql';

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('access_token');
  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  return forward(operation);
});

const errorLink = new ErrorLink(({ error }) => {
  if (!CombinedGraphQLErrors.is(error)) return;

  const isUnauthenticated = error.errors.some(
    (err) => err.extensions?.['code'] === UNAUTHENTICATED,
  );

  // Hanya logout bila sesi yang ada sudah tidak valid. Login dengan password
  // salah juga UNAUTHENTICATED, tapi belum ada token sehingga tidak di-redirect.
  if (isUnauthenticated && localStorage.getItem('access_token')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
});

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

export const apollo = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([errorLink, authLink, httpLink]),
});

export type {
  ApolloQueryResult,
  DefaultContext,
  FetchResult,
  MutationOptions,
  OperationVariables,
  QueryOptions,
};
export { ApolloClient, gql };
