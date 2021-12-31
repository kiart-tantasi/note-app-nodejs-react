// ------------------ IMPORT ------------------ //
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const path = require("path");
// ------------------ DATABASE ------------------ //
// const atlasurl = "mongodb+srv://" + process.env.DB_ID + ":" + process.env.DB_PASS + "@cluster0.wt1i5.mongodb.net/postitDB";
// mongoose.connect(atlasurl); 
mongoose.connect("mongodb://localhost:27017/postitDB");
const User = require("./mongodb/mongodb");
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

app.get("/getAdmin", function(req,res) {
    User.findOne({username:"admin"}, (err,result) => {
        if (!err) {
            res.json(result);
        }
    })
})

// EVERY OTHERS' AND REACT'S ROUTES
app.get("/*", function(req,res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});
//Test Code//

// Find
User.findOne({username:"admin"}, (err,result) => {
    const categories = result.categories;
    console.log("Name of Categories:");
    categories.map(x => console.log(x.name));
    // const animals = result.categories.find(x => x.name === "Animals");
    // console.log("NAME:", animals.name);
    // console.log("POSTS:", animals.posts);
})

//Create a Category

// User.findOne({username:"admin"}, (err,result) => {
//     result.categories.push({
//         name:"Money",
//         posts: [
//             {item:"U.S. Dollar",des:"USA",date: new Date().getTime()},
//             {item:"Thai baht",des:"Thailand",date: new Date().getTime()}
//         ]
//     })
//     result.save( err => {
//         if (err) {console.log(err)}
//         else {
//             console.log("new category saved.")
//         }
//     });
// })


//Remove a category

// User.updateOne(
//     {"username":"admin"},
//     {$pull:{categories:{name:"Animals"}}},
//     (err) => {
//         if (err) {console.log(err)}
//         else {
//             console.log("Removed a category")
//         }
//     }
// )


// Add a Note into a category

// User.findOne({username:"admin"}, (err,result) => {
//     const category = result.categories.find(x => x.name === "Animals");
//     category.posts.push({item:"delete me",des:"please", date: new Date().getTime()});
//     result.save( err => {
//         if (err) {console.log(err)}
//         else {
//             console.log("added into a category");
//         }
//     });
// })

// Remove a note from a category

// User.updateOne(
//     {username:"admin",
//     "categories.name":"Animals"},
//     {$pull: {"categories.$.posts":{"item":"delete me"}}},
//     err => {
//         if (err) {console.log(err)}
//         else {
//             console.log("deleted successfully");
//         }
//     }
// )

// Move a note into another category
// Add the note into the new category + Delete the note from the old category

// Archives
// 1. Add into archives and delete from main posts 
// 2. Add into archives and delete from the category
//Icon to open Archrives


//---------//

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