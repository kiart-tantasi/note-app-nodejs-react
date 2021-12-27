require("dotenv").config();
const express = require("express");
const app = express();
// const cors = require("cors");
// const MongoStore = require("connect-mongo");
const path = require("path");
app.use(express.static(path.join(__dirname, "build"))); //homepage
app.use(express.urlencoded({extended:false}));
app.use(express.json());
// app.use(
//     cors({
//         origin: "http://localhost:3000",
//         credentials: true
//     })
// );
// app.enable("trust proxy");
// AUTHENTICATION
const bcryptjs = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// Mongoose Setup
const mongoose = require("mongoose");
const atlasurl = 
"mongodb+srv://" + process.env.DB_ID + ":" + process.env.DB_PASS + "@cluster0.wt1i5.mongodb.net/postitDB";
mongoose.connect(atlasurl);
// mongoose.connect("mongodb://localhost:27017/postitDB");
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

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // proxy: true,
    // store: MongoStore.create({ mongoUrl: "mongodb+srv://" + process.env.DB_ID + ":" + process.env.DB_PASS + "@cluster0.wt1i5.mongodb.net/sessionDB" }),
    cookie: {maxAge: 7*24*60*60*1000} 
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
    callbackURL: "https://post-it-app-by-me.herokuapp.com/auth/callback"
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
        res.status(400).send("Both username and password are required.");
        return;
    }
    const username = req.body.username;
    const password = await bcryptjs.hash(req.body.password,10);
    const findUsername = await User.findOne({username:username});
    // username is used
    if (findUsername) {
        res.status(403).send("The username is already used.");
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
    res.status(200).send("Successfully Authenticated.");
});
// JUST FOR TESTING
app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendStatus(200)
    } else {
        res.sendStatus(403);
    }
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
app.get("/auth", passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/callback", passport.authenticate("google", { failureRedirect: "/"}), (req,res) => {
    res.redirect("/");
});

// FAILURE REDIRECT

app.get("/failureAuth", (req,res) => {
    res.status(401).send("Authentication failed.")
})

// ---------------------- POSTS ROUTES ---------------------- //

// GET ALL POSTS
app.get("/posts", blockNotAuthenticated, (req,res) => {
    res.status(200).json(req.user.posts);
});

// ADD A POST
app.post("/posts", blockNotAuthenticated, (req,res) => {
    const serialId = req.user.serialId;
    const item = req.body.item;
    const des = req.body.des;
    if (!item) {
        res.status(400).send("The title fill is required.");
        return;
    }
    const date = new Date().getTime();
    User.findOne({serialId:serialId},(err,result) => {
        result.posts.push({item:item,des:des,date:date});
        const id = result.posts[result.posts.length-1]._id;
        result.save((err) => {
            if (err) {console.log(err)}
            else {
                res.status(200).json({id:id,date:date});
            }
        })
    })
    
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

// EVERY OTHERS' AND REACT'S ROUTES
app.get("/*", function(req,res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});


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


const port = process.env.PORT || 4000;
app.listen(port, () => console.log("running on", port));