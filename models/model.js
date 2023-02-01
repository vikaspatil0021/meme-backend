import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';

const storiesSchema = mongoose.Schema({
    title:String,
    content:String,
    userId:String,
    tags:[],
    likes:[],
    imageURL:String
})

const userSchema = mongoose.Schema({
    email:String,
    password:String,
    name:String,
    profileImgURL:String,
    instaUsername:String,
    bio:String
})

const commentSchema = mongoose.Schema({
    user:{},
    storyId:String,
    content:String,
    reply:[]
})

userSchema.plugin(passportLocalMongoose);

const StoriesContent = mongoose.model("story",storiesSchema);
const UserInfo = mongoose.model("user",userSchema);
const CommentsContent = mongoose.model("comment",commentSchema);



export  {StoriesContent,UserInfo, CommentsContent};