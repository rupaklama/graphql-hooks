import { endPointURL } from './client';

// note - Example on how to make GraphQL Request over HTTP
// to display all jobs
export async function loadJobs() {
  const response = await fetch(endPointURL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      {
        jobs {
          id
          title
          company {
            id
            name
          }
        }
      }`,
    }),
  });

  const responseBody = await response.json();
  return responseBody.data.jobs;
}

// to display single job by passing Query Variable
export async function loadJob(id) {
  const response = await fetch(endPointURL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `

      # 'query' is required before Operational Name if we want to pass query variables
      # we can also have Operational Name 'JobQuery' which is very useful for debugging

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
      `,

      // adding another property named 'variables' to pass query variables
      variables: { id },
    }),
  });

  const responseBody = await response.json();

  // Basic GraphQL Error Handling for development, to handle errors from GraphQL response object
  // note - this Error overlay is only visible when we run react app in development mode
  // In production, users won't see it
  if (responseBody.errors) {
    // .join to return a Single Message from errors array, separating with new line
    const message = responseBody.errors.map(error => error.message).join('\n');
    throw new Error(message);
  }

  // to access 'id' of Job Object to display its data
  return responseBody.data.job;
}

// to display single Company by passing Query Variable
export async function loadCompany(id) {
  const response = await fetch(endPointURL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `
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
      `,

      // adding another property named 'variables' to pass query variables
      variables: { id },
    }),
  });

  const responseBody = await response.json();
  // company object
  return responseBody.data.company;
}
