import { CombinedGraphQLErrors } from '@apollo/client';

export interface GraphQLErrorInfo {
  code: string;
  message: string;
}

/** Kode error dari backend (NestJS + Apollo) saat token tidak ada/tidak valid atau kredensial salah. */
export const UNAUTHENTICATED = 'UNAUTHENTICATED';

export const ErrorHelper = {
  /** Normalisasi error Apollo Client v4 menjadi { code, message }. */
  parse(error: unknown): GraphQLErrorInfo {
    if (CombinedGraphQLErrors.is(error) && error.errors.length > 0) {
      const [first] = error.errors;
      const code = first.extensions?.['code'];

      return {
        code: typeof code === 'string' ? code : 'UNKNOWN',
        message: first.message,
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  },

  isErrorInfo(value: unknown): value is GraphQLErrorInfo {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as GraphQLErrorInfo).code === 'string' &&
      typeof (value as GraphQLErrorInfo).message === 'string'
    );
  },
};
