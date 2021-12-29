const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../mongodb/mongodb");

function initializeGooglePassport(passport) {
    passport.use( new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "https://post-it-app-by-me.herokuapp.com/api/auth/callback"
    },
        async function(accessToken, refreshToken, profile, cb) {
            const user = await User.findOne({googleId:profile.id});
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
}

module.exports = initializeGooglePassport;