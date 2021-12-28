const LocalStrategy = require("passport-local").Strategy;
const User = require("../mongodb/mongodb");
const bcryptjs = require("bcryptjs");

function initializeLocalPassport(passport) {
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
}

module.exports = initializeLocalPassport;