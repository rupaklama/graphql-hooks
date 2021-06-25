// local database
const db = require('../db');

// NOTE - The resolve function works also by returning a Promise - async fashion
// making request to outside server

// The purpose of resolve is that it must return a data that represents a 'data/document'
// resolve func also works by returning a PROMISE - async request
// very important func which performs the 'Search & Get the Data' into our database
// parentValue - don't get used very often
// args - This is an Object which gets call whatever arguments are passed into the original query

// This will contain Query Resolvers
// This is to resolve all the 'type Query' in our Schema file
const Query = {
  // Resolvers are Functions to resolve Query Types by fetching data from our db
  // all the Resolvers here are returned in the "data" property of Response Object

  // .list() method returns array of 'Job' from our local database
  jobs: () => db.jobs.list(),
};

// NOTE - whenever there's a Job Object where request is a 'company' field,
// this function will be invoked
// NOTE - To access data from JOB to COMPANY
// Note - setting up Nested Queries with field - 'company'
// Linking another data table
// similar to foreign key in relational database

// The resolver must reflect Schema so we need to declare new resolver object
// for the Job type since it has a nested query filed(foreign key) to another object - company
const Job = {
  // resolver function receives some args - resolve(parentValue, args)
  // 'parentValue' is the Parent Data table - 'Job'
  // note - we are resolving Company for the Job, the 'parentValue' object  is the 'Job'
  // .get method - returning a Company whose 'id' is SAME as the Company ID of this Job instance
  company: job => db.companies.get(job.companyId),
  // NOTE - THIS RESOLVER FUNCTION KNOWS HOW TO RETURN COMPANY FOR THE JOB
};

// This RESOLVERS Object will be pass down into Apollo server instance in server.js
module.exports = { Query, Job };
