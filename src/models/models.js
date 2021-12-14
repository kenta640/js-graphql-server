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




const User = mongoose.model('User', UserSchema)
const Friend = mongoose.model('Friend', FriendSchema)

module.exports = {
    User,
    Friend
}