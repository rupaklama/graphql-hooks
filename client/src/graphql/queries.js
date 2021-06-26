// instance of Apollo Client
import { client } from './client';

// With Apollo Client, we need to parse query using graphQL library
// note - gql is known as 'tag' function
import gql from 'graphql-tag';

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
      }
    }
  `;

  // NOTE - Since it's a Mutation, we use 'mutate' method instead of a 'query'
  // this takes an Object with some properties & the main one is 'mutation' - graphQL mutation to send
  const { data } = await client.mutate({
    mutation: mutation,
    // adding another property named 'variables' to pass query variables
    variables: { input },
  });

  return data.job;
}

// note - Example on how to make GraphQL Request over HTTP
// to display all jobs
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
  const { data } = await client.query({ query: query });

  // 'data' property of graphQL query consists response data
  return data.jobs;
}

// to display single job by passing Query Variable
export async function loadJob(id) {
  const query = gql`
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

  // note - here we also need to pass query variables
  // we can do it using another option - 'variables' prop
  const { data } = await client.query({ query, variables: { id } });

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
