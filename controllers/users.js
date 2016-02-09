var user = require("../models/user.js");

var users = {

  getAll: function(req, res) {
    
  },
 
  getOne: function(req, res, next) {
      user.loginUser(req.body.email, req.body.password, 
        function(user){
          next(req, res, user);
      });
  },

  validateOne: function(key, callback) {
    user.validateUser(key, 
        function(user){
          if (user) {
            callback(user);
          } else {
            callback(false);
          }
      });
  },
 
  create: function(req, res, next) {
    user.signUpUser(req.body.email, req.body.password,
      function(newUser){
        next(req, res, newUser);
    });
  },
 
  update: function(req, res) {
    
  },
 
  delete: function(req, res) {
    
  }
};
 
module.exports = users;