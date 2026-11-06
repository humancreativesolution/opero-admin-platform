import { apollo } from '@lib/graphql/apollo';
import { provideApollo } from 'apollo-angular';

export function provideCustomApollo() {
  return provideApollo(() => apollo);
}
