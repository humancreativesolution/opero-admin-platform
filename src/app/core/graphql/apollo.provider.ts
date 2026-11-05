import { provideApollo } from 'apollo-angular';
import { apollo } from '@lib/graphql/apollo';

export function provideCustomApollo() {
  return provideApollo(() => apollo);
}
