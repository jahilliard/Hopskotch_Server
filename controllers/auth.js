var jwt = require('jwt-simple');
var passport = require("../middleware/passport.js");

function genToken(data) {
  var expires = expiresIn(7); // 7 days
  data.exp = expires;
  var token = jwt.encode(data, require('../config/secret')());
 	
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

			res.json({authToken: genToken({user: user.email})});
		}) (req, res, next);
	},

	fbAuthenticate: function(req, res ,next) {
		passport.authenticate('facebook-token', {session: false}, function(err, user, info){
			if (err) {return next(err)}
			if(!user) {
				res.status(401);
				return res.json({ error: "wrong credentials" });
			}
			res.json({authToken: genToken({user: user.id})});
		})
		(req, res, next);
	},
}

module.exports = auth;  