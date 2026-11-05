import { apollo, gql, FetchResult, MutationOptions, OperationVariables, ApolloQueryResult, QueryOptions } from './apollo';
import { ErrorHelper } from './error';

export class GraphQL {
  protected async mutate<TData = any, TVariables extends OperationVariables = OperationVariables>(
    query: string,
    options?: MutationOptions<TData, TVariables>
  ): Promise<FetchResult<TData>> {
    console.log('[GraphQL] mutate called, query:', query);
    try {
      return await (apollo as any).mutate({
        mutation: gql`${query}`,
        ...(options || {}),
      });
    } catch (error: any) {
      console.error('[GraphQL] mutate error:', error);
      throw ErrorHelper.parse(error);
    }
  }

  protected async query<T = any, TVariables extends OperationVariables = OperationVariables>(
    query: string,
    options?: Partial<QueryOptions<TVariables, T>>
  ): Promise<ApolloQueryResult<T>> {
    console.log('[GraphQL] query called, query:', query);
    try {
      return await (apollo as any).query({
        query: gql`${query}`,
        ...(options || {}),
      });
    } catch (error: any) {
      console.error('[GraphQL] query error:', error);
      throw ErrorHelper.parse(error);
    }
  }
}
