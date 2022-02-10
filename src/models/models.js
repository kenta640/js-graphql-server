const mongoose = require('mongoose')
const { Schema } = mongoose


const UserSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    
    username: {
        type: String,
        required: true
    },
    follow: {
        type: [String],
        default: ["n-J6T8zbX","SBKNruDGX"]
    },
    password: {
        type: String,
    },
    email: {
        type: String,
        //required: true
    },
    created: {
        type: Date,
    },
    token: {
        type: String,
    },
    userType: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    }, 
})

const PostSchema = new Schema({   
    id: {
        //userid
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },     
    created: {
        type: Date,
    },
})

const GoodSchema = new Schema({
    postid: {
        type: String,
        required: true
    },
    good: {
        type: Number,
        default: 0
    },
})


const Users = mongoose.model('User', UserSchema)
const Posts = mongoose.model('Post', PostSchema)
const Good = mongoose.model('Good', GoodSchema)
module.exports = {
    Users,
    Posts, 
    Good
}