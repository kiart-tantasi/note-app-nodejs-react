require("dotenv").config();
// EXPRESS SETUP
const express = require("express");
const app = express();
app.use(express.urlencoded({extended:false}));
app.use(express.json());
// AUTHENTICATION
const bcryptjs = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// Mongoose Setup
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/postitDB");
const postSchema = mongoose.Schema({
    item: String,
    des: String,
    date: Number
});
const localUserSchema = mongoose.Schema({
    username: String,
    loginId: String,
    password: String,
    joinDate: Number,
    posts: [postSchema],
    archives: [postSchema]
})
const googleUserSchema = mongoose.Schema({
    googleId: String,
    loginId: String,
    name: String,
    joinDate: Number,
    posts: [postSchema],
    archives: [postSchema]
});
const LocalUser = mongoose.model("LocalUser", localUserSchema);
const GoogleUser = mongoose.model("GoogleUser", googleUserSchema);

// ---- TESTING CODE ----

// async function test() {
//     const res = await LocalUser.findOne({username:"admin"});
//     console.log(res);
// }
// test();

// ---------------------

// PASSPORT INITIALIZATION
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

// LOCAL STRATEGY
passport.use(new LocalStrategy(
    async function(username, password, done) {
        const user = await LocalUser.findOne({ username: username });
        // No existing username
        if (!user) {
            return done(null, false);
        //Correct Password
        } else if (await bcryptjs.compare(password, user.password)) {
            return done(null, user);
        // Wrong Password
        } else {
            return done(null, false); 
        }

    }
  ));

// GOOGLE STRATEGY
passport.use( new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/callback"
},
    async function(accessToken, refreshToken, profile, cb) {
        const user = await GoogleUser.findOne({googleId:profile.id});
        // FIND OR CREATE
        if (!user) {
            const userObject = {
                googleId: profile.id,
                loginId: "google" + profile.id,
                name: profile.displayName,
                joinDate: new Date().getTime(),
                posts: [{ item: "โพสต์แรกของฉัน", des: "ดูแลสุขภาพด้วยครับ", date: new Date().getTime()}],
                archives: [{ item: "โพสต์ที่ถูกบันทึก", des: "โพสต์ที่ถูกบันทึกจะไม่แสดงในหน้าหลักของแอปโพสต์อิท", date: new Date().getTime()}]
            }
            const createUser = new GoogleUser(userObject);
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
passport.serializeUser((user,done) => done(null, user.loginId));
passport.deserializeUser( async(loginId,done) => {
    console.log(loginId);
    // Google Strategy
    if (loginId.substring(0,6) == "google") {
        const user =  await GoogleUser.findOne({loginId:loginId});
        return done(null, user);
    // Local Strategy
    } else if (loginId.substring(0,5) == "local") {
        const user = await LocalUser.findOne({loginId:loginId});
        return done(null, user);
    }
})

// LOCAL AUTH ROUTES
app.post("/register", async(req,res) => {
    if (!req.body.username || !req.body.password) {
        res.status(403).send("both username and password are required.");
        return;
    }
    const username = req.body.username;
    const password = await bcryptjs.hash(req.body.password,10);
    const findUsername = await LocalUser.findOne({username:username});
        // used username
    if (findUsername) {
        res.status(403).send("username used");
    } else {
        const createUser = new LocalUser({
            username: username,
            loginId: "local" + username,
            password: password,
            joinDate: new Date().getTime(),
            posts: [{ item: "โพสต์แรกของฉัน", des: "ดูแลสุขภาพด้วยครับ", date: new Date().getTime()}],
            archives: [{ item: "โพสต์ที่ถูกบันทึก", des: "โพสต์ที่ถูกบันทึกจะไม่แสดงในหน้าหลักของแอปโพสต์อิท", date: new Date().getTime()}]
        })
        createUser.save((err) => {
            if (err) {console.log(err)}
            else {res.sendStatus(200)}
        })
    }
})
app.post("/login",
    passport.authenticate("local", {failureRedirect: "/failureAuth"}), (req,res) => {
    res.status(200).send("Logged in successfully.");
});

// GOOGLE AUTH ROUTES
app.get("/auth", passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/callback", passport.authenticate("google", { failureRedirect: "/failureAuth"}), (req,res) => {
    res.status(200).send("Logged in successfully.");
});

// FAILURE REDIRECT

app.get("/failureAuth", (req,res) => {
    res.send("Authentication failed.")
})

// ---------------------- POSTS ROUTES ---------------------- //

// get all

app.get("/posts", async (req,res) => {
    if (req.isAuthenticated()) {
        res.status(200).send(req.user.posts);
    } else {
        res.status(403).send("Please Log In")
    }
})


const port = 4000 || process.env.port;
app.listen(port, () => console.log("running on", port));