// local database
const db = require('../db');

// NOTE - The resolve function works also by returning a Promise - async fashion
// making request to outside server

// The purpose of resolve is that it must return a data that represents a 'data/document'
// resolve func also works by returning a PROMISE - async request
// very important func which performs the 'Search & Get the Data' into our database
// parentValue - don't get used very often
// args - This is an Object which gets call whatever arguments are passed into the original query

// Query Resolvers
// This is to resolve all the 'type Query' in our Schema file
const Query = {
  // Resolvers are Functions to resolve Query Types by fetching data from our db
  // all the Resolvers here are returned in the "data" property of Response Object

  // .list() method returns array of 'Job' from our local database
  jobs: () => db.jobs.list(),

  // Since we are inside of Query Type, 'parentValue' is the 'root' object
  // Second param is the args with Query Variables passed in graphQL query
  job: (root, args) => db.jobs.get(args.id),

  // resolver query to return a specific Company object with id
  company: (root, { id }) => db.companies.get(id),
};

// THIS IS TO REFLECT THE STRUCTURE OF OUR SCHEMA TYPES
// BY DEFINING NEW RESOLVER OBJECT TYPES

// NOTE - whenever there's a Job Object where request is a 'company' field,
// this function will be invoked
// NOTE - To access data from JOB to COMPANY
// Note - setting up Nested Queries with field - 'company'
// Linking another data table
// similar to foreign key in relational database

// The resolver must reflect Schema so we need to declare 'New Resolver Object'
// for the Job type since it has a nested query filed(foreign key) to another object - company
const Job = {
  // resolver function receives some args - resolve(parentValue, args)
  // 'parentValue' is the Parent Data table - 'Job' Object
  // note - we are resolving Company for the Job, the 'parentValue' object  is the 'Job'
  // .get method - returning a Company whose 'id' is SAME as the Company ID of this Job instance
  company: job => db.companies.get(job.companyId),
  // 'job' arg is Job Object - { id, title, description, companyId }

  // NOTE - THIS RESOLVER FUNCTION KNOWS HOW TO RETURN COMPANY FOR THE JOB
};

// NOTE - whenever there's a Company Object where request is a 'job' field, this function will be invoked
// note - A 'jobs' field is inside of 'type Company' Schema
const Company = {
  // 'parentValue' is the Parent Data table - 'Company' on this table
  // list() method returns an array
  jobs: company => db.jobs.list().filter(job => job.companyId === company.id),
};

// This RESOLVERS Object will be pass down into Apollo server instance in server.js
module.exports = { Query, Job, Company };
