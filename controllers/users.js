var user = require("../models/user.js");

var users = {

  getAll: function(req, res) {
    
  },
 
  getOne: function(req, res, callback) {
      user.loginUser(req.body.email, req.body.password, 
        function(user){
          callback(req, res, user);
      });
  },

  validateOne: function(req, res, next, callback) {
    user.validateUser(req.body.key, 
        function(user){
          if (user) {
            callback(req, res, next, user);
          } else {
            callback(req, res, next, false);
          }
      });
  },
 
  create: function(req, res, callback) {
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