var user = require("../models/user.js");

var users = {

  getAll: function(req, res) {
    
  },
 
  getOne: function(req, res, callback) {
    user.loginUser(req.body.email, req.body.password, 
      function(err, user){
        if (err) {
          callback(req, res, false);
        } else {
          callback(req, res, user);
        }
    });
  },

  validateOne: function(key, callback) {
    user.validateUser(key, function(err, user){
      callback(err, user)
    });
  },
 
  create: function(req, res, next) {
    user.signUpUser(req.body.email, req.body.password, function(err, newUser){
      if (err){
        res.status(404);
        res.json({
          "errcode": err.code,
          "message": err.err
        });
      } else {
        res.status(201);
        res.json({
          "newId": newUser.insertedIds[0]
        });
      }
    });
  },
 
  update: function(req, res) {
    
  },
 
  delete: function(req, res) {
    
  }
};
 
module.exports = users;