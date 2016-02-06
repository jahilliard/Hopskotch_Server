var user = require("../models/user.js");

console.log(user.signUpUser);

var users = {

  getAll: function(req, res) {
    
  },
 
  getOne: function(req, res, callback) {
    callback(req, res, user.validateUser(req.body.email, req.body.password));
  },
 
  create: function(req, res, callback) {
    console.log("users controller Create");
    user.signUpUser(req.body.email, req.body.password,
      function(newUser){
        callback(req, res, newUser);
      });
  },
 
  update: function(req, res) {
    
  },
 
  delete: function(req, res) {
    
  }
};
 
module.exports = users;