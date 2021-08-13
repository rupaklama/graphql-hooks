// local database
const db = require('../db');

// NOTE - The resolve function works also by returning a Promise - async fashion
// making request to outside server

// The purpose of resolve is that it must return a data that represents a 'data/document'
// resolve func also works by returning a PROMISE - async request
// very important func which performs the 'Search & Get the Data' into our database
// parentValue - don't get used very often
// args - This is an Object which gets call whatever arguments are passed into the original query

// Query Resolvers - A resolver is a function that generates a response object
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

// THIS IS TO REFLECT THE STRUCTURE OF OUR SCHEMA TYPES BY DEFINING NEW RESOLVER OBJECT TYPES
// since we have a NESTED FIELDS, MUTATIONS & SUBSCRIPTIONS

// NOTE - whenever there's a Job Object where request is a 'company' field,
// this function will be invoked
// NOTE - To access data from JOB to COMPANY
// Note - setting up Nested Queries with field - 'company'
// Linking another data table
// similar to foreign key in relational database

// The resolver must reflect Schema so we need to declare 'New Resolver Object'
// for the 'Job' type since it has a nested query filed(foreign key) to another object - company
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

// we also need to match the MUTATION Structure Schema also
// Mutation is a function that returns the value
const Mutation = {
  // root is the parent object - parentValue, args we defined in Mutation Schema to change data

  // NOTE - CHECK IF USER IS AUTHENTICATED BEFORE POSTING A JOB
  // WE DO THIS WITH THIRD PARAM PASSED TO RESOLVED FUNC - CONTEXT
  // With 'Context' we can access things that are not part of GraphQL itself but are provided by our Application.

  // createJob: (root, { title, description, companyId }) => {
  // Passing INPUT TYPES which contains all the args above
  createJob: (root, { input }, context) => {
    // note - context can contain whatever we want &
    // it's up to us to put something into the context in first place
    // Note - We pass 'context' property into an instance of Apollo Server in server.js as 'initial setup'
    // console.log('context:', context);

    // this will skip rest of the code here
    // return null;

    // user not authenticated
    if (!context.user) {
      // NOTE - throwing an error will cause GraphQL server to return Error Response Object
      throw new Error('Unauthorized');
    }

    // using 'create' method which takes an Object fields to create a NEW Object
    // & returns 'String' that will be the ID of NEWLY CREATED OBJECT
    // const id = db.jobs.create({ title, description, companyId });
    // const id = db.jobs.create(input);
    const id = db.jobs.create({ ...input, companyId: context.user.companyId });
    // setting 'companyId field' from context so that we can use it in JobForm component

    // here returning 'Job' object to display data in the Client after creating right away
    // that we don't have to make another query to display Job data
    return db.jobs.get(id);
    // by doing this, we can also query any Child Schema & its FIELDS related to 'Job' object
    // with SINGLE QUERY instead of TWO - BEST PRACTICE FOR MUTATION
  },
};

// This RESOLVERS Object will be pass down into Apollo server instance in server.js
module.exports = { Query, Job, Company, Mutation };
