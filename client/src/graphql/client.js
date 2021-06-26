// ApolloClient is interacting with our GraphQL server on the backend
// to make request for DATA & Storing that data locally when the response comes back

// NOTE - Using Apollo Client for 'caching' over GraphQL Requests over HTTP
// ApolloLink Class is for Authentication & need to modify the 'link' config
import { ApolloClient, HttpLink, InMemoryCache, ApolloLink } from '@apollo/client';

// Common logic to make GraphQL Requests over HTTP
import { getAccessToken, isLoggedIn } from '../auth';

// apollo server
const endPointURL = 'http://localhost:9000/graphql';

// SETTING AUTHORIZATION HEADER to persist auth user with token
// ApolloLink instances take a function with two params
// operation - graphQL query or mutation to be executed
// forward - a Function that allow us to CHAIN MULTIPLE STEPS TOGETHER
const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    // passing props object to be use in the request
    operation.setContext({
      // setting http headers
      // We are setting Request Header in operation context to use in http request
      headers: {
        authorization: 'Bearer ' + getAccessToken(),
      },
    });
  }

  // note - saying at the end, forward 'operation' to the next step in
  // 'link: ApolloLink.from' of ApolloClient instance below
  return forward(operation);
});

// creating new instance of 'ApolloClient' & pass it into the <ApolloProvider>
// uri - specifies the URL of our GraphQL server
// cache - is an instance of InMemoryCache, which Apollo Client uses to cache query results after fetching them
export const client = new ApolloClient({
  // config setup

  // link - how to connect to server, using HttpLink to communicate to the Server
  // passing array which contains multiple ApolloLink instances
  link: ApolloLink.from([
    // authLink code will be executed first & then HttpLink to make request
    // By adding authLink before, we are 'preparing request' for setting Authorization Header before it gets sent
    authLink,
    new HttpLink({ uri: endPointURL }),
  ]),
  // NOTE - Sine we are using HttpLink to communicate with a Server,
  // we need to customize the behaviour of this link by using 'ApolloLink.from'

  // cache - one of the main feature of Apollo Client
  cache: new InMemoryCache(),
});
