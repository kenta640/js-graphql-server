const {Users, Posts} = require('../models/models')
const { generate } = require('shortid')
const {GraphQLScalarType, Kind} = require('graphql');
const { AuthenticationError, ValidationError, UserInputError } = require('apollo-server-errors');
//const context = require('./context')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const getToken = ({id, username, email}) => {

      return jwt.sign(
        {
          id, username, email
        },
        process.env.SECRET,
        {
          expiresIn: '1d'
        }
      )

}

const resolvers = {
    Date:  new GraphQLScalarType({
      name: 'Date',
      description: 'Date custom scalar type',
      serialize(value) {
        return value.getTime(); // Convert outgoing Date to integer for JSON
      },
      parseValue(value) {
        return new Date(value); // Convert incoming integer to Date
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
          return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
        }
        return null; // Invalid hard-coded value (not an integer)
      },
    }),
    Query: {
      users (parent, args, context, info)  {
        //if (!context.user||!context.user.roles.includes('admin')) 
        //return null;
        return User.find()
          .then(user => {
            return user.map(r=>({...r._doc}))
          })
          .catch (err=>{
            console.error(err)
          });
      },
      allPosts: async (parent, args, context, info) => {
        return await Posts.find()
      },
    },

    Mutation: {
      async LoginUser(_, { email, password}) {

        //const {errors, valid} = validateLogin(email, password)
        //if(!valid) throw new UserInputError('Error', {error})
        
        const user = await User.findOne({email: email});
        if(!user) throw new AuthenticationError('this user is not found')

        const match = await bcrypt.compare(password, user.password)
        if (!match) throw new AuthenticationError('wrong password!');

        const token = getToken(user);
        
        return {
          id: user._id,
          ...user._doc,
          token
        }
      },

      //Stronger mutation
      async RegisterUser(_, { user}) {
        //const {errors, valid} = validateRegister(username, password, confirmPassword, email)
        //if(!valid) throw UserInputError('Error', { errors });

        const uniqueName = user.username
        tempuser = await Users.findOne({username: uniqueName});
        console.log(user.username)
        console.log(tempuser)
        if (tempuser) throw new ValidationError('This username is not valid!');
       
        const newUser = new User({
          id: generate(),
          username: user.username,
          password: await bcrypt.hash(user.password, 10),
          email: user.email,
          created: new Date().toISOString()
        });
        const res = await newUser.save();
        //console.log(res)
        const token = getToken( {id: res.id, username: res.username, email: res.email} );
        console.log(token);
        return {
          id: res._id,
          ...res._doc, 
          token
        };
      },
      
      //Set user id (email) on frontend
      addPost: (_, { id, text }) => {

        const postObj = new Post({ id, text });
        //cache.set(id, username);
        return postObj.save()
        .then(result=>{
          return {...result._doc}
        })
        .catch (err=> {
          console.error(err);
        })
      },
    },
    Post: {
      user: async (parent, args)=>{
        return await Users.findOne({id: parent.id})
      }
    },
  };
  
  module.exports = resolvers