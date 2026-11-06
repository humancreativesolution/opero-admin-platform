import {
  type ApolloClient,
  apollo,
  type FetchResult,
  gql,
  type MutationOptions,
  type OperationVariables,
  type QueryOptions,
} from './apollo';
import { ErrorHelper } from './error';

/** Never log queries or variables here: the login operation carries the password. */
export class GraphQL {
  protected async mutate<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  >(
    query: string,
    options?: Omit<MutationOptions<TData, TVariables>, 'mutation'>,
  ): Promise<FetchResult<TData>> {
    try {
      return await apollo.mutate<TData, TVariables>({
        ...options,
        mutation: gql`${query}`,
      } as MutationOptions<TData, TVariables>);
    } catch (error) {
      throw ErrorHelper.parse(error);
    }
  }

  protected async query<T = unknown, TVariables extends OperationVariables = OperationVariables>(
    query: string,
    options?: Omit<QueryOptions<TVariables, T>, 'query'>,
  ): Promise<ApolloClient.QueryResult<T>> {
    try {
      return await apollo.query<T, TVariables>({
        ...options,
        query: gql`${query}`,
      } as QueryOptions<TVariables, T>);
    } catch (error) {
      throw ErrorHelper.parse(error);
    }
  }
}
