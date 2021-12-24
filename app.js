require("dotenv").config();
// EXPRESS SETUP
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cors());
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
const userSchema = mongoose.Schema({
    googleId: String,
    username: String,
    password: String,
    serialId: String,
    name: String,
    joinDate: Number,
    posts: [postSchema],
    archives: [postSchema]
})
const User = mongoose.model("User", userSchema);

// ---- TESTING CODE ----

// async function test() {
//     const res = await User.findOne({username:"admin"});
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
        const user = await User.findOne({ username: username });
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
        const user = await User.findOne({googleId:profile.id});
        // FIND OR CREATE
        if (!user) {
            const userObject = {
                googleId: profile.id,
                serialId: "google" + profile.id,
                name: profile.displayName,
                joinDate: new Date().getTime(),
                posts: [{ item: "โพสต์แรกของฉัน", des: "ดูแลสุขภาพด้วยครับ", date: new Date().getTime()}],
                archives: [{ item: "โพสต์ที่ถูกบันทึก", des: "โพสต์ที่ถูกบันทึกจะไม่แสดงในหน้าหลักของแอปโพสต์อิท", date: new Date().getTime()}]
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
passport.serializeUser((user,done) => done(null, user.serialId));
passport.deserializeUser( async(serialId,done) => {
    const user = await User.findOne({serialId:serialId});
    return done(null, user);
})

// LOCAL AUTH ROUTES
app.post("/register", async(req,res) => {
    if (!req.body.username || !req.body.password) {
        res.status(403).send("Both username and password are required.");
        return;
    }
    const username = req.body.username;
    const password = await bcryptjs.hash(req.body.password,10);
    const findUsername = await User.findOne({username:username});
    // username is used
    if (findUsername) {
        res.status(403).send("The username is alrady used.");
    } else {
        const createUser = new User({
            username: username,
            serialId: "local" + username,
            password: password,
            joinDate: new Date().getTime(),
            posts: [{ item: "โพสต์แรกของฉัน", des: "ดูแลสุขภาพด้วยครับ", date: new Date().getTime()}],
            archives: [{ item: "โพสต์ที่ถูกบันทึก", des: "โพสต์ที่ถูกบันทึกจะไม่แสดงในหน้าหลักของแอปโพสต์อิท", date: new Date().getTime()}]
        })
        createUser.save((err) => {
            if (err) {console.log(err)}
            else {res.status(200).send("registered successfully")}
        })
    }
})
app.post("/login",
    blockAuthenticated,
    passport.authenticate("local", {failureRedirect: "/failureAuth"}), (req,res) => {
    res.redirect("/posts");
});

// TEMPORARY FOR TESTING ONLY (get /logout)
app.get("/logout", blockNotAuthenticated, (req,res) => {
    req.logout();
    res.status(200).send("logged out successfully");
})

app.post("/logout", blockNotAuthenticated, (req,res) => {
    req.logout();
    res.status(200).send("logged out successfully");
})

// GOOGLE AUTH ROUTES
app.get("/auth", blockAuthenticated, passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/callback", passport.authenticate("google", { failureRedirect: "/failureAuth"}), (req,res) => {
    res.redirect("/posts");
});

// FAILURE REDIRECT

app.get("/failureAuth", (req,res) => {
    res.send("Authentication failed.")
})

// ---------------------- POSTS ROUTES ---------------------- //

// GET ALL POSTS
app.get("/posts", blockNotAuthenticated, (req,res) => {
    res.status(200).send(req.user.posts);
});

// ADD A POST
app.post("/posts", blockNotAuthenticated, (req,res) => {
    const serialId = req.user.serialId;
    const item = req.body.item;
    const des = req.body.des;
    if (!item || !des) {
        res.status(403).send("Both title and detail are required.");
        return;
    }
    const date = new Date().getTime();
    User.updateOne(
        {serialId:serialId},
        {$push:{posts:{item:item,des:des,date:date}}},
        (err,result) => {
            if (err) {console.log(err)}
            else {
                res.redirect("/posts");
            }
        }
    )
    
})

// DELETE A POST
app.delete("/posts/:itemId", blockNotAuthenticated, (req,res) => {
    const itemId = req.params.itemId;
    const serialId = req.user.serialId;
    User.updateOne(
        {serialId:serialId},
        {$pull: {posts:{_id:itemId}}},
        err => {
            if (err) {console.log(err)}
            else {
                res.status(200).send("deleted successfully");
            }
        }
    )
})

// UPDATE A POST
app.patch("/posts/:itemId", blockNotAuthenticated, (req,res) => {
    const itemId = req.params.itemId;
    const serialId = req.user.serialId;
    const newDes = req.body.des;
    User.updateOne(
        {serialId: serialId,
        "posts._id": itemId},
        { $set: {"posts.$.des":newDes}},
        (err) => {
            if (err) {console.log(err)}
            else {
                res.status(200).send("updated successfully");
            }
        }
    )
})

// BLOCK PEOPLE WITH NO AUTHENTICATION
function blockNotAuthenticated(req,res,next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send("There is no authentication.");
    }
}

// BLOCK PEOPLE WHO ALREADY LOGGED IN
function blockAuthenticated(req,res,next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send("already logged in");
    }
}


const port = 4000 || process.env.port;
app.listen(port, () => console.log("running on", port));