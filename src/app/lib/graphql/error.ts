import { CombinedGraphQLErrors } from '@apollo/client';

export interface GraphQLErrorInfo {
  code: string;
  message: string;
}

export const UNAUTHENTICATED = 'UNAUTHENTICATED';

/**
 * NestJS puts class-validator messages in extensions.originalError.message;
 * the top-level message is generic ("Bad Request Exception").
 */
function readOriginalMessage(originalError: unknown): string | undefined {
  if (typeof originalError !== 'object' || originalError === null) return undefined;
  const message = (originalError as { message?: unknown }).message;

  if (Array.isArray(message)) {
    const parts = message.filter((part): part is string => typeof part === 'string');
    return parts.length > 0 ? parts.join(', ') : undefined;
  }

  return typeof message === 'string' ? message : undefined;
}

export const ErrorHelper = {
  parse(error: unknown): GraphQLErrorInfo {
    if (CombinedGraphQLErrors.is(error) && error.errors.length > 0) {
      const [first] = error.errors;
      const code = first.extensions?.['code'];

      return {
        code: typeof code === 'string' ? code : 'UNKNOWN',
        message: readOriginalMessage(first.extensions?.['originalError']) ?? first.message,
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
