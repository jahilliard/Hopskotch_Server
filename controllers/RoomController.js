var Room = require("../models/Room.js");
var User = require("../models/User.js");
var UserController = require("../controllers/UserController.js");
var Chat = require("../models/Chat.js");
var Location = require("../models/Location.js");
var helper = require("../helpers/helper.js");
var _ = require('lodash');
var ws = require("../ws/ws.js");

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  return 0;
}

function getProps(fields){
  return _.pick(fields, ['name', 'mainImg', 'menu', 'radius']);
}

function getGeom(fields){
  return _.pick(fields, ['coordinates']);
}

function addMemberToRoom(room, newMemberId, callback) {
  User.getById(newMemberId, function(err, newMember) {
    if (err) {
      return callback(err, null);
    } 

    if (newMember.currentCircle != "") {
      var oldRoomId = newMember.currentCircle;
      Room.getById(oldRoomId, function(err, targetRoom) {
        if (err){
          console.log(err);
        } else {
          notifyRoomMemberLeft(oldRoomId, newMember);
        }
      });
    }

    newMember.currentCircle = room._id;

    newMember.saveUser(function(err, savedUser){
      if (err) {
        return callback(err, null);
      } else {
        Room.getAllMembers(room._id, function(err, members) {
          if (err) {
            return callback(err, null);
          }

          //don't include yourself 
          var filteredMembers = _.filter(members, function(user){return user._id != newMemberId;});
          console.log(filteredMembers);
          var filteredMemberIds = _.map(filteredMembers, function(user){return user._id;});

          Chat.getChatsForUser(savedUser._id, filteredMemberIds, function(err, chats) {
              if (err) {
                return callback(err, null);
              }

              //add chatNumber 
              chatResult = _.map(filteredMembers, function(otherMember){
                var otherUserId = otherMember._id;
                chat = _.find(chats, function(c) { return (c.user1 == otherUserId) || (c.user2 == otherUserId) });
                otherUserObject = otherMember.toObject();
                otherUserObject.lastMsgNum = 0;
                if (chat) {
                  if (chat.user1 == newMemberId) {
                    otherUserObject.lastMsgNum = chat.user1LastMsgNumber;
                  } else {
                    otherUserObject.lastMsgNum = chat.user2LastMsgNumber;
                  }
                }

                return otherUserObject;
              });

              UserController.addMatches(savedUser._id, filteredMemberIds, chatResult, function(err, result) {
                if (err) {
                  return callback(err, null);
                } 

                filteredMemberIds = _.map(filteredMembers, function(member){return member._id.toString()});
                ws.notifyUsersNewCircleMember(filteredMemberIds, savedUser);
                var data = {"circle": room, "members": result};
                return callback(null, data);
              });
          });
        });
      }
    });
  });
}

function notifyRoomMemberLeft(roomId, oldMember) {
  Room.getAllMembers(roomId, function(err, members) {
    if (err) {
      res.status(404);
      res.json({
        "message": "Could not retrieve circle members"
      });
      return;
    }

    //remove the new member from the list
    var filteredMembers = _.filter(members, function(user){return user._id != oldMember._id});
    console.log("NOTIFYING OF LEAVE");
    console.log(filteredMembers);
    //notify all people in circle of member leaving
    ws.notifyUsersCircleMemberLeave(filteredMembers, oldMember);
  });
}

var RoomController = {
 
  getAll: function(req, res) {
    Room.getAll(function(err, rooms){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "rooms": rooms});
      }
    });
  },
 
  getById: function(req, res) {
    Room.getById(req.params.id, function(err, room){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "room": room});
      }
    });
  },

  getByLocationId: function(req, res) {
    Room.getByLocationId(req.params.id, function(err, room){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "room": room});
      }
    });
  },
 
  create: function(req, res) {
    if (helper.verifyBody(req, res, ['registrationInfo'])) {
      return;
    }

    var props = getProps(req.body.registrationInfo);
    var geom = getGeom(req.body.registrationInfo);

    var newRoom = new Room({properties: props, geometry: geom});
    newRoom.saveRoom(function(err, newRoom){
      if (err){
        console.log(err);
        res.status(404);
        res.json({
          "message": err.message
        });
      } else {
        res.status(201);
        res.json({
          "newId": newRoom.id,
        });
      }
    }); 
  },
 
  update: function(req, res) {
    if(helper.verifyBody(req, res, ['fields'])){
      return;
    }

    var fields = req.body.fields;

    if(validateFields(fields, req, res)){
      return;
    }

    Room.getById(req.params.id, function(err, targetRoom){
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
          "message": "Room with this id does not exist"
        });
        return;
      }

      targetRoom.updateRoom(fields);
      targetRoom.saveRoom(function(err, updatedRoom){
        if(err){
          res.status(404);
          res.json({
            "message": err.message
          });
        } else {
          res.status(200);
          res.json({
            "message": "success"
          })
        }
      });
    })
  },
 
  delete: function(req, res) {
    Room.getById(req.params.id, 
      function(err, targetRoom) {
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
            "message": "Establishment with this id does not exist"
          });
          return;
        }

        targetRoom.delete(function(err, deletedRoom) {
          if (err){
            res.status(404);
            res.json({
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

  //radius in meters
  /*findAllInRadius = function(location, radius, callback){


    this.find(
      { "geometry.coordinates": {
          $nearSphere: {
            $geometry: {
              type : "Point",
              coordinates : location
            },
            $minDistance: 0,
            $maxDistance: radius + "this."
          }
        }
      }, function(err, foundRooms){
        if (err){
          callback(err, null);
        } else{
          callback(null, foundRooms);
        }
      })
  },*/

  //radius in meters
  getInRadius: function(req, res){
    if (helper.verifyRequest(req, res, ['location', 'radius'])){
      return;
    }

    var radius = parseFloat(req.query.radius);
    var location = req.query.location
    location = location.map(function(coord) {return parseFloat(coord)});


    var referencePoint= 
      {
          "type" : "Point",
          "coordinates" : location
      }

    Room.aggregate([
        { "$geoNear": {
           "near": referencePoint,
           "distanceField": "distance",
           "spherical": true
       }},

       { "$project": {
           "_id": 1,
           "properties.radius": 1,
           "properties.name": 1,
           "properties.address": 1,
           "geometry.coordinates": 1,
           "within": { "$lt": [ "$distance", { "$add": [ "$properties.radius", radius ] } ] }
       }},

       { "$match": { "within": true } }
    ], function(err, circles) {
        console.log("WHATTT");
        console.log(circles);
        if (err) {
          res.status(404);
          res.json({
            "message": err.message
          });
        } else {
          res.status(200);
          res.json({
            "message": "success",
            "circles": circles
          });
        }
    });

    /*RoomController.findAllInRadius(req.query.location, req.query.radius, 
      function(err, foundCircles){
        if (err){
          res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success",
              "circles": foundCircles
            })
          }
      })*/
  },

  addMemberToRoomByLocation: function(req, res) {
    if(helper.verifyBody(req, res, ['coordinate'])){
      return;
    }

    var newMemberId = req.params.userId;
    var locationCoor = req.body.coordinate;

    var referencePoint= 
      {
          "type" : "Point",
          "coordinates" : locationCoor
      }

    Room.aggregate([
        { "$geoNear": {
           "near": referencePoint,
           "distanceField": "distance",
           "spherical": true
       }},

       { "$project": {
           "_id": 1,
           "properties.radius": 1,
           "properties.name": 1,
           "properties.address": 1,
           "geometry.coordinates": 1,
           "within": { "$lt": [ "$distance", "$properties.radius"] } 
       }},

       { "$match": { "within": true } },

       { "$sort": {distance : 1} }
    ], function(err, foundRoom){
      if (err) {
        res.status(404);
        res.json({
          "message": err.message
        });
        return;
      }
      
      if (foundRoom.length == 0){
        console.log("NOTHINGGG");
        User.getById(newMemberId, function(err, newMember) {
          if (err) {
            res.status(404);
            res.json({
              "message": err.message
            });
            return;
          } 

          if (newMember.currentCircle != "") {
            var oldRoomId = newMember.currentCircle;
            notifyRoomMemberLeft(oldRoomId, newMember);
            newMember.currentCircle = "";
            newMember.saveUser(function(err, savedUser){
              if (err) {
                console.log(err);
              }
            });
          }

          res.status(200);
          res.json({
            "message": "Not in the radius of any rooms"
          });
        });
        return;
      }

      var roomId = foundRoom[0];

      Room.getById(roomId, function(err, targetRoom) {
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
            "message": "Room with this id does not exist"
          });
          return;
        }

        addMemberToRoom(targetRoom, newMemberId, function(err, data) {
          if (err) {
            res.status(404);
            res.json({
              "message": err.message
            });
            return;
          } else {
            console.log("SUCCESS");
            res.status(200);
            res.json({
              "message": "success",
              "data": data
            });
          }
        });
      });
    });
  }, 

  addMemberToRoomWithId: function(req, res) {
    var newMemberId = req.params.userId;
    var roomId = req.params.id;

    Room.getById(roomId, function(err, targetRoom) {
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
          "message": "Room with this id does not exist"
        });
        return;
      }

      addMemberToRoom(targetRoom, newMemberId, function(err, data) {
        if (err) {
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } else {
          res.status(200);
          res.json({
            "message": "success",
            "data": data
          });
        }
      });
    });
  },

  removeMemberFromRoom: function(req, res) {
    var oldMemberId = req.params.userId;
    var roomId = req.params.id;

    Room.getById(roomId, function(err, targetRoom) {
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
          "message": "Room with this id does not exist"
        });
        return;
      }

      targetRoom.removeMemberFromRoom(oldMemberId, function(err, oldMember){
        if (err) {
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        }

        notifyRoomMemberLeft(roomId, oldMember);
        res.status(200);
        res.json({
          "message": success
        });
      });
    });
  }

};

module.exports = RoomController;