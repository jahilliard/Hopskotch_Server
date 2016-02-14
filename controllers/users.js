var User = require("../models/user.js");
var helper = require("../helpers/helper.js");

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  if("_id" in fields) {
    res.status(401);
    res.json({
      "message": "cannot specify _id field"
    });
    return 1;
  }

  else if ("fbID" in fields) {
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

var users = {

  create: function(req, res) {
    if (helper.verifyBody(req, res, ['registrationInfo'])) {
      return;
    }
    if (validateFields(req.body.registrationInfo, req, res)) {
      return;
    }

    var newUser = new User(req.body.registrationInfo);
    newUser.hashPassword(function(err) {
      if (err){
        res.status(404);
        res.json({
          "errcode": err.code,
          "message": err.errmsg
        });
      } else {
        newUser.save(function(err, newUser){
          if (err){
            res.status(404);
            res.json({
              "errcode": err.code,
              "message": err.errmsg
            });
          } else {
            res.status(201);
            res.json({
              "newId": newUser.insertedIds[0]
            });
          }
        }); 
      }
    })
  },

  update: function(req, res) {
    if(helper.verifyBody(req, res, ['fields'])) {
      return;
    }

    var fields = req.body.fields;
    if(validateFields(fields, req, res)){
      return;
    }

    User.prototype.getById(req.params.id, function(err, targetUser){
      if (err){
        res.status(404);
        res.json({
          "errcode": err.code,
          "message": err.errmsg
        });
      } else {
        if (!targetUser){
          res.status(404);
          res.json({
            "message": "This user does not exist"
          });
          return;
        }
        targetUser.update(fields, function(err){
          targetUser.save(function(err, updatedUser){
            if(err){
              res.status(404);
              res.json({
                "errcode": err.code,
                "message": err.errmsg
              });
            } else {
              res.status(200);
              res.json({
                "updatedUser": updatedUser
              })
            }
          });
        })
      }
    })
  },
 
  delete: function(req, res) {
    User.prototype.getById(req.params.id, function(err, targetUser) {
      if (err){
        res.status(404);
        res.json({
          "errcode": err.code,
          "message": err.errmsg
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
            "message": err.errmsg
          });
        } else {
          res.status(200);
          res.json({
            "deletedUser": deletedUser
          })
        }
      });
    });
  },

  getAll: function(req, res) {
    User.prototype.getAllUsers(function(err, users){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "users": users});
      }
    });
  },

  getById: function(req, res) {
    User.prototype.getById(req.params.id, 
      function(err, user){
        if (err) {
          rest.status(404);
          res.json({
            "errcode": err.code,
            "message": err.errmsg
          });
        } 

        if (!targetUser){
          res.status(404);
          res.json({
            "message": "No such user"
          });
          return;
        }

        res.json({"user": user});
    });
  },

  getByEmail: function(email, callback) {
    User.prototype.getByEmail(email, function(err, user){
      callback(err, user)
    });
  },

  login: function(email, password, callback){
    User.prototype.getByEmail(email, function(err, user) {
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
      }
    });
  }
};
 
module.exports = users;