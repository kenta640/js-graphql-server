const { ApolloServer} = require("apollo-server-express");
const express =require("express"); 
const cors = require('cors')
const {
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require('graphql-upload');
require('dotenv/config')
const mongoose = require('mongoose')

// Provide resolver functions for your schema field
const typeDefs = require('./schemas/typedefs')
const resolvers = require('./resolvers/resolvers')
const { createServer } = require("http");

const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");


(async ()=>{
  const PORT = process.env.PORT||3001;
  const app = express();
  const httpServer = createServer(app);
  
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    introspection: true,
  });

  await server.start();

  app.use(cors());
  app.use(graphqlUploadExpress());
  
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  server.applyMiddleware({app})

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: server.graphqlPath }
  );

  mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASS}@cluster0.rwluw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
  .then( (res) => {
      httpServer.listen({ port: PORT }, () => {
          console.log(`Your Apollo Server is running on http://localhost:${PORT}/graphql `)
      })
  })
  .catch( (err) => {
      console.error('Error while connecting to MongoDB', err);
  }) 
})();