var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var users = require('../controllers/users.js');

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
          return done(null, null);
        }


      }
    );
}));

module.exports = passport;  