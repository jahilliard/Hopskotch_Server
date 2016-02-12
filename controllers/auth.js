var jwt = require('jwt-simple');
var passport = require("../middleware/passport.js");

function genToken(user) {
	console.log(user);
  var expires = expiresIn(7); // 7 days
  var token = jwt.encode({
  	user: user.email,
    exp: expires
  }, require('../config/secret')());
 
  return token;
}
 
function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

var auth = {

	authenticate: function(req, res, next){
		passport.authenticate('local', {session: false},
		function(err, user, info){
			if (err) {return next(err)}
			if(!user) {
				res.status(401);
				return res.json({ error: "wrong credentials" });
			}

			res.json(genToken(user));
		}) (req, res, next);
	}
}

module.exports = auth;  