var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var User = require('../models/User.js');
var UserController = require('../controllers/UserController.js');
var config = require('../config/config.js');

const FACEBOOK_APP_ID = "1774769169417863";
const FACEBOOK_APP_SECRET = "bfbf840b9b878e3a43dde2364889b6da";

function getFbAttributesFromProfile(profile){
  console.log(profile);
  var attributes = 
    {
      "fbId": profile.id,
      "firstName": profile._json.first_name,
      "lastName": profile._json.last_name,
      "email": profile._json.email
    }

  return attributes;
}

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },

  function(email, password, done) {
    UserController.checkLoginCredentials(email, password, done);
  }));

passport.use(new FacebookTokenStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
  },

  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      User.getByFbId(profile.id, function(err, returnedUser) {
        if (err) {
          return done(err);
        }
        if (returnedUser) {
          returnedUser.isCreated = false;
          console.log(accessToken)
          console.log(refreshToken)
          console.log(profile)
          return done(null, returnedUser);
        } else {
          var attributes = getFbAttributesFromProfile(profile);
          //add additional attributes
          attributes.nickname = "";
          var newUser = new User(attributes);
          newUser.saveUser(function(err, newUser){
            if (err){
              return done(err, null);
            } else {
              newUser.isCreated = true;
              return done(null, newUser);
            }
          });
        }
      });
    });
  }
));

module.exports = passport;  