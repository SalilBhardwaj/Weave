import { InMemoryCache, ApolloClient, HttpLink } from '@apollo/client';
import { useAuthStore } from '../store/auth';
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ extensions }) => {
            if (
                extensions?.code === 'UNAUTHENTICATED'
            ) {
                useAuthStore.getState().logout();
                window.location.href = '/auth';
            }
        });
    }
})

export const client = new ApolloClient({
    link: errorLink.concat(new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_URI })),
    cache: new InMemoryCache(),
});