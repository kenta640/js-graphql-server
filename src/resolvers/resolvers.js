const {Users, Posts, Good} = require('../models/models')
const { generate } = require('shortid')
const {GraphQLScalarType, Kind} = require('graphql');
const { AuthenticationError, ValidationError, UserInputError } = require('apollo-server-errors');
//const context = require('./context')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
require('dotenv/config')

//PubSub for real time updates
const {PubSub} =require("graphql-subscriptions")
const pubsub = new PubSub();
const POST_ADDED = "POST_ADDED";

/**
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSWORD
  }
});

const mailOptions = (email)= {
  from: process.env.GMAIL_ADDRESS,
  to: email,
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
}; */

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
        return await Posts.find().sort({created: -1});
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
       /** //sends email and validate if the email is valid
        const mailOption = mailOptions(user.email)
        transporter.sendMail(mailOption, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        }); */
        
        const newUser = new Users({
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
        
        const postObj = await new Posts({ id, 
                                          text, 
                                          created: new Date().toISOString()}).save();
        await new Good({postid: postObj._id}).save()
        //cache.set(id, username);
        await pubsub.publish(POST_ADDED, { postAdded: postObj });
        return postObj
      },
      deletePost:async (parent, args, content, info) => {
        try{
          await Posts.deleteOne({ _id: args._id, id: args.id})
          await Good.deleteOne({postid: args._id})
        } catch (e) {
          print(e);
       }
      },
      addReply: async (parent, args, context, info) => {
        return await Posts.find({id: args.id, replyTo: args.replyTo, text: args.text})
      },
      
      addGood: async (parent, args, content, info) => {
        console.log(args.postid)
          try{
            await Good.bulkWrite([
              { updateOne :
                    {
                      "filter" : { "postid" : args.postid },
                      "update" : { $inc : { "good" : 1 } }
                    }
          },])
          } catch(e){
            print(e);
          }
            
      },

      addFollow: async (parent, args) => {
        try {
          await Users.bulkWrite([
            {
              "filter" : { "id" : parent.id },
              "update": {$push: {follow: args.id}}
            }
          ])
        } catch (e) {
          print(e)
        }
      }

      },

      User: {
        follow: async (parent)=>{
          
          let follow = []
          
          parent.follow.forEach(
            (element)=>{
              if(typeof element==="string"){
                follow.push(Users.findOne({id: element}))
              }

            }
          )
          return follow;
          
         /** 
          let follow=[]
          console.time('promise_all');
          const ids = parent.follow
          const response = await Promise.all(ids.map(async (id) => {
            return follow.push(Users.findOne({id: id})).promise()
          }))
          console.log(response)
          console.timeEnd('promise_all');
          */
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
          return await Good.findOne({postid: parent._id})//Find by object id
        },
    },

    Subscription: {
      postAdded: {
        subscribe: () => pubsub.asyncIterator([POST_ADDED])
      }
    }
  }
  
  module.exports = resolvers