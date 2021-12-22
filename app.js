require("dotenv").config();
// EXPRESS SETUP
const express = require("express");
const app = express();
app.use(express.urlencoded({extended:false}));
app.use(express.json());
// AUTHENTICATION
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// Mongoose Setup
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/postitDB");
const postSchema = mongoose.Schema({
    item: String,
    des: String,
    date: Number
})
const userSchema = mongoose.Schema({
    googleId: String,
    name: String,
    joinDate: Number,
    posts: [postSchema],
    archives: [postSchema]
})
const User = mongoose.model("User", userSchema);

// TRY DB
// User.findOne({googleId:"100949762406881290850"}, (err,result) => {
//     if (err) return;
//     else {
//         result.posts.push({item:"just title."})
//         result.save( err => {
//             if (err) {console.log(err)}
//             else {
//                 console.log("saved successfully");
//             }
//         });
//     }
// })

// PASSPORT INITIALIZATION
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
// GOOGLE AUTH STRATEGY
passport.use( new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/callback"
},
    async function(accessToken, refreshToken, profile, cb) {
        const user = await User.findOne({googleId:profile.id});
        // FIND OR CREATE
        if (!user) {
            const userObject = {
                googleId: profile.id,
                name: profile.displayName,
                joinDate: new Date().getTime(),
                posts: [{ item: "โพสต์แรกของฉัน", des: "ดูแลสุขภาพด้วยครับ", date: new Date().getTime()}],
                archives: []
            }
            const createUser = new User(userObject);
            createUser.save((err) => {
                if (err) {console.log(err)}
                else {
                    return cb(null,userObject);
                }
            });
        } else if (user) {
            return cb(null, user)
        }
    }
))

// SERIALIZE - DESERIALIZE
passport.serializeUser((user,done) => done(null, user.googleId));
passport.deserializeUser( async(googleId,done) => {
    const user =  await User.findOne({googleId:googleId});
    return done(null, user);
})

app.get("/auth", passport.authenticate("google", { scope: ["profile"] }));


app.get("/auth/callback", passport.authenticate("google", { failureRedirect: "https://www.google.com"}), (req,res) => {
    res.send( JSON.stringify(req.user));
});




// ---------------------- POSTS ROUTES ---------------------- //

// get all


const port = 4000 || process.env.port;
app.listen(port, () => console.log("running on", port));