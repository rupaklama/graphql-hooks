import { endPointURL } from './client';

// note - Example on how to make GraphQL Request over HTTP
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
