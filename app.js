// ------------------ IMPORT ------------------ //
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./mongodb/mongodb");
// ------------------ DATABASE ------------------ //
const atlasurl = "mongodb+srv://" + process.env.DB_ID + ":" + process.env.DB_PASS + "@cluster0.wt1i5.mongodb.net/postitDB";
mongoose.connect(atlasurl); // mongoose.connect("mongodb://localhost:27017/postitDB");
// ------------------ MIDDLEWARE ------------------ //
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 7*24*60*60*1000} 
}))
app.use(passport.initialize());
app.use(passport.session());
require("./passport-config/passport-config")(passport);

// ------------------ ROUTES ------------------ //
require("./auth-routes/auth-routes")(app, passport);

app.get("/api/posts", blockNotAuthenticated, (req,res) => {
    res.status(200).json(req.user.posts);
});

app.post("/api/posts", blockNotAuthenticated, (req,res) => {
    const serialId = req.user.serialId;
    const item = req.body.item;
    const des = req.body.des;
    if (!item) {
        res.status(400).send("The title field is required.");
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

app.delete("/api/posts/:itemId", blockNotAuthenticated, (req,res) => {
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

app.patch("/api/posts/:itemId", blockNotAuthenticated, (req,res) => {
    const itemId = req.params.itemId;
    const serialId = req.user.serialId;
    const newTitle = req.body.item;
    const newDes = req.body.des;
    if (!newTitle) {
        res.status(400).send("The title field is required.");
        return;
    }
    User.updateOne(
        {serialId: serialId,
        "posts._id": itemId},
        { $set: {"posts.$.item":newTitle, "posts.$.des":newDes}},
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

// BLOCK PEOPLE WITH NO AUTHENTICATION AND PEOPLE WHO ALREADY LOGGED IN
function blockNotAuthenticated(req,res,next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send("There is no authentication.");
    }
}
function blockAuthenticated(req,res,next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send("already logged in");
    }
}
const port = process.env.PORT || 4000;
app.listen(port, () => console.log("running on", port));