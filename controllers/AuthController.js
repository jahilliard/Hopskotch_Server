var jwt = require('jwt-simple');
var passport = require("../middleware/passport.js");
var User = require("../models/User.js");

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

function isAdminUrl(url){
	return (url.indexOf('admin') >= 0);
}

function validateNormal(email, req, res, next){
	// Authorize the user to see if s/he can access our resources
	User.getByEmail(email, function(err, dbUser){
	  if (dbUser) {
	  	//check if is an admin-privilged resource
	  	var reqAdmin = isAdminUrl(req.url);
      if (!reqAdmin || (reqAdmin && dbUser.role == 'admin'))
      {
        next(); // To move to next middleware
      } else {
        res.status(403);
        res.json({
          "status": 403,
          "message": "Not Authorized"
        });
        return;
      }
	  } else {
      // No user with this name exists, respond back with a 401
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid User"
      });
      return;
	  }
	}); 
}

function validateFb(fbId, req, res, next){
	// Authorize the user to see if s/he can access our resources
	User.getByFbId(fbId, function(err, dbUser){
	  if (dbUser) {
	  	//check if is an admin-privilged resource
	  	var reqAdmin = isAdminUrl(req.url);
	  	console.log(dbUser);
      if (!reqAdmin || (reqAdmin && dbUser.role == 'admin'))
      {
        next(); // To move to next middleware
      } else {
        res.status(403);
        res.json({
          "status": 403,
          "message": "Not Authorized"
        });
        return;
      }
	  } else {
      // No user with this name exists, respond back with a 401
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid User"
      });
      return;
	  }
	}); 
}

var auth = {
	validateRequest: function(req, res, next) {
	  // When performing a cross domain request, you will recieve
	  // a preflighted request first. This is to check if our the app
	  // is safe. 
	 
	  // We skip the token outh for [OPTIONS] requests.
	  //if(req.method == 'OPTIONS') next();
	 
	  var token = (req.body && req.body.access_token) || 
	  	(req.query && req.query.access_token) || req.headers['x-access-token'];

    // x-key is the email
	  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) 
	  	|| req.headers['x-key'];

	  var fbId = (req.body && req.body.fbId) || (req.query && req.query.fbId) 
	  	|| req.headers['fbId'];

	  console.log(token);
	  console.log(key);
	  console.log(fbId);
	 
	 	if (!((token && key) || (token && fbId))){
	    res.status(401);
	    res.json({
	      "status": 401,
	      "message": "Invalid access_token, key, or fbId"
	    });
	    return;
	 	}

    try {
      var decoded = jwt.decode(token, require('../config/secret.js')());
      console.log(decoded);
      if (decoded.exp <= Date.now()) {
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }

      var userAuth = decoded.user;
      var fbAuth = decoded.fbId;

      if ((userAuth && (userAuth != key)) || (fbAuth && (fbAuth != fbId))) {
        res.status(403);
        res.json({
          "status": 403,
          "message": "Not Authorized"
        });
        return;
      }

      if (userAuth){
      	validateNormal(userAuth, req, res, next);
	    } else {
	    	validateFb(fbAuth, req, res, next);
	    }
    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
	},

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
		passport.authenticate('facebook-token', {session: false}, 
			function(err, user, info){
				if (err) {return next(err)}
				if(!user) {
					res.status(401);
					return res.json({ error: "wrong credentials" });
				}
				res.json({isCreated: user.isCreated, id: user._id, fbId: user.fbId, authToken: genToken({fbId: user.fbId})});
		})
		(req, res, next);
	},
}

module.exports = auth;  