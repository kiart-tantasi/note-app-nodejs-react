const User = require("../mongodb/mongodb");
const bcryptjs = require("bcryptjs");

module.exports = function(app, passport) {
    app.post("/api/register", async(req,res) => {
        if (!req.body.username || !req.body.password) {
            res.status(400).send("Both username and password are required.");
            return;
        }
        const username = req.body.username;
        const password = await bcryptjs.hash(req.body.password,10);
        const findUsername = await User.findOne({username:username});
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
    
    app.post("/api/login",
        blockAuthenticated,
        passport.authenticate("local", {failureRedirect: "/api/failureAuth"}), (req,res) => {
        res.status(200).send("Successfully Authenticated.");
    });
    
    app.get("/api/user", (req, res) => {
        if (req.isAuthenticated()) {
            res.sendStatus(200)
        } else {
            res.sendStatus(404);
        }
      });
    
    app.get("/api/logout", blockNotAuthenticated, (req,res) => { // (GET ONLY FOR FOR TESTING )
        req.logout();
        res.status(200).send("logged out successfully");
    })
    
    app.post("/api/logout", blockNotAuthenticated, (req,res) => {
        req.logout();
        res.status(200).send("logged out successfully");
    })
    
    app.get("/api/auth/google", blockAuthenticated, passport.authenticate("google", { scope: ["profile"] }));
    
    app.get("/api/auth/callback", passport.authenticate("google", { failureRedirect: "/authentication"}), (req,res) => {
        res.redirect("/");
    });
    
    app.get("/api/failureAuth", (req,res) => {
        res.status(401).send("authentication failed.")
    })

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
}