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

/**
 * Base class untuk service GraphQL. Error selalu dinormalisasi lewat
 * ErrorHelper.parse sehingga pemanggil menerima { code, message }.
 *
 * Catatan: jangan log query/variables di sini — query login memuat password.
 */
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
