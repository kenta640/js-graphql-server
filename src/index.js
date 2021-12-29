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



async function startServer(){
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    context: ({ req }) => {
      // get the authorization from the request headers
      // return a context obj with our token. if any!
      const auth = req.headers.authorization || '';
      return {
        auth
      };
    }
  });
  await server.start();
  const app = express();
  app.use(cors());
  app.use(graphqlUploadExpress());
  
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  server.applyMiddleware({app})
  const port = process.env.PORT||3001

  mongoose
    .connect(`mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASS}@cluster0.rwluw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
    .then( (res) => {
        app.listen({ port: port }, () => {
            console.log(`Your Apollo Server is running on http://localhost:${port}/graphql `)
        })
    })
    .catch( (err) => {
        console.error('Error while connecting to MongoDB', err);
    }) 
}

startServer()