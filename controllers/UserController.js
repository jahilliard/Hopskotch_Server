var _ = require('lodash');

var helper = require("../helpers/helper.js");
var Match = require("../models/Match.js");
var Room = require("../models/Room.js");
var User = require("../models/User.js");
var Chat = require("../models/Chat.js");

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

  else if ("currentCircle" in fields) {
    res.status(401);
    res.json({
      "message": "cannot specify currentCircle field"
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
    newUser.picture = ["null", "null", "null"];
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

  addMatches: function(userId, filteredMemberIds, currentResults, callback){
    Match.getMatchesForUser(userId, filteredMemberIds, function(err, matches) {
      if (err) {
        callback(err, null);
      }

      //add match info
      result = _.map(currentResults, function(otherMember){
        var otherUserId = otherMember._id;
        match = _.find(matches, function(m) { return (m.userId1 == otherUserId) || (m.userId2 == otherUserId) });


        var matchInfo = {};
        if(!_.isUndefined(match)) {
          matchInfo.matchId = match._id;
          if (match.userId1 == userId){
            matchInfo.yourOffers = match.user1Offers;
            matchInfo.otherOffers = match.user2Offers;
          } else {
            matchInfo.yourOffers = match.user2Offers;
            matchInfo.otherOffers = match.user1Offers;
          }
        }

        otherMember.matches = matchInfo;
        return otherMember;
      });

      callback(null, result);
    });
  },

  getCircleInfo: function(req, res){
    var userId = req.params.id;
    User.getById(userId, function(err, member) {
      if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

      if (!member){
        res.status(404);
        res.json({
          "message": "User does not exist"
        });
        return;
      }

      if (member.currentCircle == ""){
        res.status(200);
        res.json({
          "message": "success",
          "data": {
            "circle": "",
            "members": []
          }
        })
        return;
      }

      Room.getById(member.currentCircle, function(err, targetRoom) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!targetRoom){
          res.status(404);
          res.json({
            "message": "Could not find room user is currently in"
          });
          return;
        }

        Room.getAllMembers(targetRoom._id, function(err, members) {
          //don't include yourself 
          var filteredMembers = _.filter(members, function(user){return user._id != userId;});
          var filteredMemberIds = _.map(filteredMembers, function(user){return user._id;});

          Chat.getChatsForUser(userId, filteredMemberIds, function(err, chats) {
              if (err) {
                res.status(404);
                res.json({
                  "message": err.message
                });
                return;
              }

              //add chatNumber 
              chatResult = _.map(filteredMembers, function(otherMember){
                var otherUserId = otherMember._id;
                chat = _.find(chats, function(c) { return (c.user1 == otherUserId) || (c.user2 == otherUserId) });
                otherUserObject = otherMember.toObject();
                otherUserObject.lastMsgNum = 0;
                if (chat) {
                  if (chat.user1 == userId) {
                    otherUserObject.lastMsgNum = chat.user1LastMsgNumber;
                  } else {
                    otherUserObject.lastMsgNum = chat.user2LastMsgNumber;
                  }
                }

                return otherUserObject;
              });

              UserController.addMatches(userId, filteredMemberIds, chatResult, function(err, result) {
                if (err) {
                  res.status(404);
                  res.json({
                    "message": err.message
                  });
                  return;
                } 

                res.status(200);
                res.json({
                  "message": "success",
                  "data": {
                    "circle": targetRoom,
                    "members": result
                  }
                });
              });
          });
        });

      });
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