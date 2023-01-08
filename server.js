import express from "express";
const app = express();

import bodyParser from "body-parser";
import mongoose from "mongoose";
import LocalStrategy from "passport-local";

import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

import passportLocalMongoose from 'passport-local-mongoose';
import passport from "passport"
import session from "express-session";

import MongoStore from "connect-mongo";
import router from "./Routes/router.js"
import { UserInfo } from "./models/model.js"

import cors from "cors";
const corsOptions = {
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
    origin: true,

}

mongoose.connect(process.env.REACT_APP_MONGO_URL, { useNewUrlParser: true });





app.enable('trust proxy'); // add this line

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cors(corsOptions));
app.use(session({
    secret: process.env.REACT_APP_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: MongoStore.create({ mongoUrl: process.env.REACT_APP_MONGO_URL, collectionName: "sessions" }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure:true,

    }
}));




// pasport auth
// passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

passport.use(UserInfo.createStrategy());
passport.serializeUser(UserInfo.serializeUser());
passport.deserializeUser(UserInfo.deserializeUser());

app.use(router);






app.listen(5000 || process.env.PORT, function () {
    console.log("Server has started.");
});