const mongoose = require('mongoose')
const { Schema } = mongoose

const FriendSchema = new Schema({
    
    id: {
        type: String,
        required: true
    },
    
})

const UserSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
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
    }
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
const Friends = mongoose.model('Friend', FriendSchema)
const Posts = mongoose.model('Post', PostSchema)
const Good = mongoose.model('Good', GoodSchema)
module.exports = {
    Users,
    Friends,
    Posts, 
    Good
}