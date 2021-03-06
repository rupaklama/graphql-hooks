// loading server-schema.graphql file with built in Node JS API (fs - file system)
const fs = require('fs');

// to integrate GraphQL with the Express Backend
const { ApolloServer, gql } = require('apollo-server-express');

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const port = 9000;
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

const app = express();
app.use(
  cors(),
  bodyParser.json(),
  expressJwt({
    secret: jwtSecret,
    credentialsRequired: false,
  })
);

// type definitions
// instead of calling gql with template literal, we can call it as a regular func
// & then use fs.readFileSync() to read our graphQL Schema file
// encoding option - to make sure it reads a file as a String, not as a binary file
// const typeDefs = gql``;
const typeDefs = gql(fs.readFileSync('./server-schema.graphql', { encoding: 'utf8' }));
// readFileSync will return the content of our Schema file &
// then parse by gql function & assigned to the typeDefs variable

// resolver object
const resolvers = require('./apollo/resolvers');

// NOTE - Basic setup for using Apollo Server with Express
// Apollo server instance with our type definitions & resolver objects
// Note - We pass 'context' property into an instance of Apollo Server in server.js as initial setup
// 'context' will be an func which gets Object that contains Express Request Object
// NOTE - this function will return 'context' object in the Resolver
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  // adding 'context' object to access request/response objects of our application
  // setting up Authentication with 'context'
  context: ({ req }) => ({
    // here we can extract any information we want from the HTTP Request &
    // make it available in the 'context' to be visible in the Resolver
    // Context contains property - { method: 'POST' }
    // method: req.method, - we get access to Http method like POST or accessing 'user' data in the request body
    // 'user undefined' - not authenticated, user is only defined if we send valid access token - jwt

    // NOTE - if user is not logged in frontend, the request will not include access token
    // In this case, req.user will be undefined - not authenticated
    // We want to check first if req.user is defined - authenticated, in this case get 'user' from db
    user: req.user && db.users.get(req.user.sub), // passing id as arg
    // 'sub' meaning 'user id' in context object, name alias by graphQL
    // Above will return all 'user' data from db
  }),
});

// applyMiddleware func - to connect Apollo server into our existing Express app
// Passing instance of express app from above - const app = express() &
// optionally we can also set a path that is where we want to expose graphQL endpoint on our server
apolloServer.applyMiddleware({ app, path: '/graphql' });
// http://localhost:9000/graphql

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.list().find(user => user.email === email);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({ sub: user.id }, jwtSecret);
  res.send({ token });
});

app.listen(port, () => console.info(`Server started on port ${port}`));
