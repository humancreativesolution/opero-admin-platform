import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3001/graphql',
  documents: ['src/**/*.graphql', 'src/**/*.ts'],
  generates: {
    'src/app/core/models/generated.graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-apollo-angular',
      ],
      config: {
        skipTypename: false,
        withHooks: true,
        withComponent: false,
        withResultType: true,
      },
    },
  },
};

export default config;
