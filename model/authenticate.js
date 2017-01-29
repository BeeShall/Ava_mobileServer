var bcrypt = require("bcryptjs");
var LocalStrategy = require('passport-local').Strategy;

exports.createUser = function (db, user, pass, role, callBack) {
    console.log(user)
    console.log(pass)
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(pass, salt, function (err, hash) {
            db.createUser(user, hash, role, callBack);
        })
    })
}



exports.setAuthentication = function (passport, db) {
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function (user, pswd, done) {
            console.log(user)

            db.getUser(user, function (error, data) {
                if (error) {
                    console.log("Invalid username.");
                    return done(null, false);
                }
                bcrypt.compare(pswd, data.password, function (err, isMatch) {
                    if (err) return done(err);
                    if (!isMatch) {
                        console.log("Invalid password");
                    } else {
                        console.log("Valid credentials");
                    }
                    console.log("Done bcrypting");
                    done(null, (isMatch ? data.id : false));
                })

            });
        }))






    passport.serializeUser(function (username, done) {
        done(null, username);
    });
    passport.deserializeUser(function (username, done) {
        done(null, username);
    });

    



}