const {Users, Posts, Good} = require('../models/models')
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
        return Users.find()
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
      postsById: async (parent, args, context, info) => {
        return await Posts.find({id: args.id})
      }
    },

    Mutation: {
      async LoginUser(_, { email, password}) {

        //const {errors, valid} = validateLogin(email, password)
        //if(!valid) throw new UserInputError('Error', {error})
        
        const user = await Users.findOne({email: email});
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
      RemoveUser: async (args)=>{
        return Users.remove({id: args.id})
      },
      //Set user id (email) on frontend
      addPost:async ( _, { id, text }) => {
        
        const postObj = await new Posts({ id, text, }).save();
        await new Good({postid: postObj._id}).save()
        //cache.set(id, username);
        
        return postObj
      },
      addReply: async (parent, args, context, info) => {
        return await Posts.find({id: args.id, replyTo: args.replyTo, text: args.text})
      },
      //It does not return anything but works fine.
      addGood: async (parent, args, content, info) => {
        return await Good.updateOne(
          ({postid: args._id}, {$inc:{ good : 1}})//increment by 1
        )
      }
    },
    Post: {
      user: async (parent, args)=>{
        return await Users.findOne({id: parent.id})
      },
      replies: async (parent) =>{
        return await Posts.find({id: parent.id, replies: parent.replies})
      },
      good: async (parent, args)=>{
        console.log(parent._id)

        return await Good.findOne({postid: parent._id})//Find by object id

      },
    },
  };
  
  module.exports = resolvers