export class ErrorHelper {
  static parse(error: any) {
    const gqlErrors = error?.graphQLErrors;
    if (gqlErrors?.length) {
      const first = gqlErrors[0];
      return {
        code: first.extensions?.['code'],
        message: first.message,
      };
    }
    return { code: 'NETWORK_ERROR', message: error?.message ?? 'Unknown error' };
  }
}
