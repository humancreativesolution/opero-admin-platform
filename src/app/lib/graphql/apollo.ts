import { ApolloClient, ApolloLink, InMemoryCache, createHttpLink, gql } from '@apollo/client/core';
import type { ApolloQueryResult, DefaultContext, FetchResult, MutationOptions, OperationVariables, QueryOptions } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';

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

const errorLink = onError((errorResponse: any) => {
  const graphQLErrors = errorResponse.graphQLErrors;
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const code = err.extensions?.['code'];
      if (code === 'UNAUTHORIZED') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }
});

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

export const apollo = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([errorLink, authLink, httpLink]),
});

export { ApolloClient, gql };
export type { ApolloQueryResult, DefaultContext, FetchResult, MutationOptions, OperationVariables, QueryOptions };
