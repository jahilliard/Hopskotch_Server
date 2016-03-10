var User = require("../models/User.js");
var helper = require("../helpers/helper.js");

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  if ("fbID" in fields) {
    res.status(401);
    res.json({
      "message": "cannot specify fbID field"
    });
    return 1;
  }

  else if ("role" in fields) {
    res.status(401);
    res.json({
      "message": "cannot specify role field"
    })
    return 1;
  }

  return 0;
}

var UserController = {

  create: function(req, res) {
    if (helper.verifyBody(req, res, ['registrationInfo'])) {
      return;
    }

    if (validateFields(req.body.registrationInfo, req, res)) {
      console.log("hello");
      return;
    }

    var newUser = new User(req.body.registrationInfo);
    newUser.saveUser(function(err, savedUser){
      if (err) {
        console.log("HERE");
        console.log(err);
        res.status(404);
        res.json({
          "message": err.message
        });
      } else {
        res.status(201);
        res.json({
          "_id": savedUser.id,
          "message": "success"
        })
      }
    });
  },

  update: function(req, res) {

    console.log("HIT")

    if (helper.verifyBody(req, res, ['fields'])) {
      console.log("helper")
      return;
    }

    var fields = req.body.fields;

    if (validateFields(fields, req, res)){
      console.log("helper")
      return;
    }

    User.getById(req.params.id, function(err, targetUser){
      if (err){
        res.status(404);
        res.json({
          "errcode": err.code,
          "message": err.message
        });
      } else {
        if (!targetUser){
          res.status(404);
          res.json({
            "message": "This user does not exist"
          });
          return;
        }
        targetUser.updateUser(fields); 
        targetUser.saveUser(function(err, updatedUser){
          if(err){
            res.status(404);
            res.json({
              "errcode": err.code,
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success"
            })
          }
        });
      }
    })
  },
 
  delete: function(req, res) {
    User.getById(req.params.id, function(err, targetUser) {
      if (err){
        res.status(404);
        res.json({
          "errcode": err.code,
          "message": err.message
        });
        return;
      } 

      if (!targetUser){
        res.status(404);
        res.json({
          "message": "No such user"
        });
        return;
      }

      targetUser.delete(function(err, deletedUser) {
        if (err){
          res.status(404);
          res.json({
            "errcode": err.code,
            "message": err.message
          });
        } else {
          res.status(200);
          res.json({
            "message": "success"
          })
        }
      });
    });
  },

  getAll: function(req, res) {
    User.getAll(function(err, users){
      if(err){
        res.status(404);
        res.json({"message": err.message});
      } else {
        res.status(200);
        res.json({"message": "success", "users": users});
      }
    });
  },

  getById: function(req, res) {
    User.getById(req.params.id, 
      function(err, user){
        if (err) {
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!user){
          res.status(404);
          res.json({
            "message": "No such user"
          });
          return;
        }

        res.json({"user": user});
    });
  },

  checkLoginCredentials: function(email, password, callback){
    User.getByEmail(email, function(err, user) {
      // In case of any error, return using the done method
      if (err)
        return callback(err, null);

      if (user) {
        user.checkPassword(password, function(err, res) 
        {
          if (err) {
            return callback(err, null);
          } 

          // User and password both match, return user from 
          // done method which will be treated like success
          if (res){
            return callback(null, user);
          } else {
            return callback(null, false);
          }
        });
      } else {
        //no such user exists
        return callback(null, false);
      }
    });
  }
};
 
module.exports = UserController;