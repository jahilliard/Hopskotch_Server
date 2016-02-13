var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var users = require('../controllers/users.js');
var User = require('../models/user.js');
var config = require('../config/config.js');

const FACEBOOK_APP_ID = "240059072994113";
const FACEBOOK_APP_SECRET = "d2b25c515e72fc81b32a7fec0865e49e";

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },

  function(username, password, done) { 
    // check in mongo if a user with username exists or not
    users.login(username, password,
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);

        if (user) {
          // User and password both match, return user from 
          // done method which will be treated like success
          return done(null, user);
        } else {
          return done(null, false);
        }
      }
    );
}));

passport.use(new FacebookTokenStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
  },

  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      users.getOne({ 'id' : profile.id }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, user);
        } else {
          User.fbSignUpUser(profile.id, function(err, newUser){
            if (err){
              return done(err);
            }
            return done(null, newUser)
          });
        }
      });
    });
  }
));

module.exports = passport;  