const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../mongodb/mongodb");
const bcryptjs = require("bcryptjs");


module.exports = function(passport) {

    passport.use(new LocalStrategy(
        async function(username, password, done) {
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false);
            } else if (await bcryptjs.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false); 
            }
    
        }
    ));

    passport.use( new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
    },
        async function(accessToken, refreshToken, profile, cb) {
            const user = await User.findOne({googleId:profile.id});
            if (!user) {
                const userObject = {
                    googleId: profile.id,
                    serialId: "google" + profile.id,
                    name: profile.displayName,
                    joinDate: new Date().getTime(),
                    posts: [{ item: "โพสต์แรกของฉัน", des: "โพสต์อิท!", date: new Date().getTime()}],
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

    passport.serializeUser((user,done) => done(null, user.serialId));
    passport.deserializeUser( async(serialId,done) => {
        const user = await User.findOne({serialId:serialId});
        return done(null, user);
    })

}