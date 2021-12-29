const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);