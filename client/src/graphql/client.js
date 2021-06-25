// ApolloClient is interacting with our GraphQL server on the backend
// to make request for DATA & Storing that data locally when the response comes back

import { ApolloClient, InMemoryCache } from '@apollo/client';

// creating new instance of 'ApolloClient' & pass it into the <ApolloProvider>
// uri specifies the URL of our GraphQL server
// cache is an instance of InMemoryCache, which Apollo Client uses to cache query results after fetching them
export const client = new ApolloClient({ cache: new InMemoryCache() });

// apollo server
export const endPointURL = 'http://localhost:9000/graphql';
