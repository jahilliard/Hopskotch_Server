var jwt = require('jwt-simple');
var users = require("../controllers/users.js");
 
var auth = {
 
  login: function(req, res) {

    var email = req.body.email || '';
    var password = req.body.password || '';
    var signUp = req.body.signUp;
    var dbUserObj;
 
    if (email == '' || password == '') {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
 
    // Fire a query to your DB and check if the credentials are valid
    users.getOne(req, res, wasUserAuthed);
  }

}
 
// private method
function wasUserAuthed(req, res, dbUserObj) {
      if (!dbUserObj) { // If authentication fails, we send a 401 back
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid credentials"
      });
      return;
    }
 
    if (dbUserObj) {
 
      // If authentication is success, we will generate a token
      // and dispatch it to the client
 
      res.json(genToken(dbUserObj));
    }
 
}

function genToken(user) {
  var expires = expiresIn(365); // 1 year
  var token = jwt.encode({
    exp: expires
  }, require('../config/secret')());
 
  return {
    token: token,
    expires: expires,
    user: user
  };
}
 
function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}
 
module.exports = auth;