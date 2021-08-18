// instance of Apollo Client
import { client } from './client';

// With Apollo Client, we need to parse query using graphQL library
// note - gql is known as 'tag' function
import gql from 'graphql-tag';

// Defining this query on the top level here so
// to reuse this query to solve some caching issues
const jobQuery = gql`
  # query name is required if we want to pass variables
  # we can also optional name - operational name
  # Naming the query can be useful for debugging

  query JobQuery($id: ID!) {
    job(id: $id) {
      id
      title
      company {
        id
        name
      }
      description
    }
  }
`;

// Sending a GraphQL Request for Mutation is no different than sending queries like below
// Calling a Mutation from Client
export async function createJob(input) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob(input: $input) {
        id
        title
        company {
          id
          name
        }
        description
      }
    }
  `;

  // NOTE - Since it's a Mutation, we use 'mutate' method instead of a 'query'
  // this takes an Object with some properties & the main one is 'mutation' - graphQL mutation to send
  const { data } = await client.mutate({
    mutation: mutation,

    // adding another property named 'variables' to pass query variables
    variables: { input },

    // 'update' prop gives us full control over the cache
    // 'update' is the function that will be called after the mutation has been executed
    // It receives TWO PARAMS
    // 'cache' - In documentation, sometimes they call it store or proxy, it is
    //  an Object that lets you manipulate what is store in the cache
    // 'mutationResult' - a response we get from the Server when we send this mutation

    // mutationResult is a data object in the response with 'data' property
    // update: (cache, mutationResult) => {
    // console.log('mutation result:', mutationResult);
    update: (cache, { data }) => {
      // NOTE - We want to save Newly Created Job object into the 'Cache'
      // So, apollo can find data in the cache & it does not need to make another request to the Server
      // NOTE - we can use 'cache' object to modify what store in cache
      // writeQuery() to save the result of query which takes some args
      // query - this is normally the regular query that generated the result
      // After executing the query, Apollo Client calls this writeQuery method
      // passing the query & data received as response. Here we are doing something special
      // we want to update the cache with data returned by mutation but we want that cached
      // data to be used whenever we make query to load the same data - job
      cache.writeQuery({
        // query that generated the result to be cached
        query: jobQuery,
        variables: { id: data.job.id },
        data: data,
      });
      // note - we also need to specify the variables associated with the query
      // we need to specify the 'id' of job to be cached,
      // when we load the job, we pass 'id' as a query variable so when writing to a cache
      // we need the SAME VARIABLE, data prop is what returned by mutation

      // note - the last argument is the 'data' prop
      // the value will be the value of the data parameter passed to this function

      // note - above we are Updating the Cache After a Mutation
      // Telling Apollo Client whenever we run this Mutation take the 'data' returned in the Response object
      // & save it to the Cache as if it was the result of running the 'Job' query for that specific job id.
      // This way when we actually run a 'Job' query with that job id, it will find the data in the Cache
      // & avoid making New Request to the Server.
    },
  });

  return data.job;
}

// note - we want to display fresh data, therefore we will 'disable caching'
// Very useful when displaying new list of data which gets fetch from the server on every render
export async function loadJobs() {
  const query = gql`
    {
      jobs {
        id
        title
        company {
          id
          name
        }
      }
    }
  `;

  // note - using instance of apollo client here now to interact with our GraphQL server
  // Client Object has a query() - to send a request or make a query, this takes an Object with
  // some properties & the main one is 'Query' - graphQL query to send

  // NOTE - query method returns a PROMISE with props like - data, errors, loading, networkStatus, stale
  // basically a graphQL Response Object, extracting 'data' property which has a Response Object
  const { data } = await client.query({ query: query, fetchPolicy: 'no-cache' });
  // NOTE - BY DEFAULT, Apollo client applies Caching 'cache-first' which might causes unexpected results
  // 'cache-first' will first try to get data from the cache, if no cache data then it will call the server
  // To override, we can use 'fetchPolicy' prop with provided values that we can choose from
  // 'no-cache' - no caching, data will be always fetch from the server

  // 'data' property of graphQL query consists response data
  return data.jobs;
}

// to display single job by passing Query Variable
export async function loadJob(id) {
  // note - here we also need to pass query variables
  // we can do it using another option - 'variables' prop
  const { data } = await client.query({ query: jobQuery, variables: { id } });

  return data.job;
}

// to display single Company by passing Query Variable
export async function loadCompany(id) {
  const query = gql`
    query CompanyQuery($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
        }
      }
    }
  `;

  const { data } = await client.query({ query, variables: { id } });
  return data.company;
}

// THIS IS AN EXAMPLE TO MAKE GRAPHQL QUERY OVER HTTP
// note - Example on how to make GraphQL Request over HTTP to display all jobs
// to display single job by passing Query Variable
// export async function loadJob(id) {
//   const response = await fetch(endPointURL, {
//     method: 'POST',
//     headers: {
//       'content-type': 'application/json',
//     },
//     body: JSON.stringify({
//       query: `

//       # 'query' is required before Operational Name if we want to pass query variables
//       # we can also have Operational Name 'JobQuery' which is very useful for debugging

//       query JobQuery($id: ID!) {
//         job(id: $id) {
//           id
//           title
//           company {
//             id
//             name
//           }
//           description
//         }
//       }
//       `,

//       // adding another property named 'variables' to pass query variables
//       // NOTE - This will be send in a JSON request
//       variables: { id },
//     }),
//   });

//   const responseBody = await response.json();

//   // Basic GraphQL Error Handling for development, to handle errors from GraphQL response object
//   // note - this Error overlay is only visible when we run react app in development mode
//   // In production, users won't see it
//   if (responseBody.errors) {
//     // .join to return a Single Message from errors array, separating with new line
//     const message = responseBody.errors.map(error => error.message).join('\n');
//     throw new Error(message);
//   }

//   // to access 'id' of Job Object to display its data
//   return responseBody.data.job;
// }
