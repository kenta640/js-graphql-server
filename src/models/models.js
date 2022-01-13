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
    good: {
        type: Number,
    }
})


const Users = mongoose.model('User', UserSchema)
const Friends = mongoose.model('Friend', FriendSchema)
const Posts = mongoose.model('Post', PostSchema)

module.exports = {
    Users,
    Friends,
    Posts
}