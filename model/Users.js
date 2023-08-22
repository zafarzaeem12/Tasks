const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    role:{
        type:String,
        enum : ['Admin','User'],
        default: 'User'
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        unique: true,
        required: true
    },
    user_image: {
        type: Array,
         required: true
    },
    phone_number: {
        type: String,
         
    },
    verification_code :{
        type:Number,
        default : 0
    },
    is_verified :{
        type: Boolean,
        default : false
    },
    user_is_profile_complete :{
        type: Boolean,
        default : false
    },
    user_is_forgot :{
        type: Boolean,
        default : false
    },
    user_authentication: {
        type: String,
        default : ""
    },
    user_social_token: {
        type: String,
    },
    user_social_type: {
        type: String,
    },
    is_profile_deleted :{
        type: Boolean,
        default : false
    },
    is_notification :{
        type: Boolean,
        default : false
    },
    is_Blocked :{
        type: Boolean,
        default : false
    },
},
    { timestamps: true }
)
module.exports = mongoose.model("User", UserSchema);