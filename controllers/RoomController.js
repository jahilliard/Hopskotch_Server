var Room = require("../models/Room.js");
var User = require("../models/User.js");
var Location = require("../models/Location.js");
var helper = require("../helpers/helper.js");
var _ = require('lodash');
var ws = require("../ws/ws.js");

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  return 0;
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
    var newRoom = new Room(req.body.registrationInfo);
    newRoom.saveRoom(function(err, newRoom){
      if (err){
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

  addMemberToRoom: function(req, res) {
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

      targetRoom.addMemberToRoom(newMemberId, function(err, newMember){
        if (err) {
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        }

        Room.getAllMembers(roomId, function(err, members) {
          if (err) {
            res.status(404);
            res.json({
              "message": "Could not retrieve circle members"
            });
            return;
          }

          //remove the new member from the list
          var filteredMembers = _.filter(members, function(user){return user._id != newMemberId});

          res.status(200);
          res.json({
            "message": "success",
            "members": filteredMembers
          });

          //notify all people in circle of new member
          ws.notifyUsersNewCircleMember(filteredMembers, newMember);
        });
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

        Room.getAllMembers(roomId, function(err, members) {
          if (err) {
            res.status(404);
            res.json({
              "message": "Could not retrieve circle members"
            });
            return;
          }

          //remove the new member from the list
          var filteredMembers = _.filter(members, function(user){return user._id != oldMemberId});

          //notify new member of successful removal from circle
          res.status(200);
          res.json({
            "message": "success"
          });

          //notify all people in circle of new member
          ws.notifyUsersCircleMemberLeave(filteredMembers, oldMember);
        });
      });
    });
  }

};

module.exports = RoomController;