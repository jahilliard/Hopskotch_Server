var Room = require("../models/Room.js");
var helper = require("../helpers/helper.js");
var _ = require('lodash');

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

  addMembersToRoom: function(req, res) {
    if (helper.verifyBody(req, res, ['newMembers'])) {
      return;
    }

    Room.getById(req.params.id, function(err, targetRoom) {
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

      var newMembers = req.body.newMembers;
      var oldMembers = targetRoom.get("members");

      //check for people whose userIds are already in the room
      for(var i = 0; i < newMembers.length; i++){
        var nMember = newMembers[i];
        if(!_.isUndefined(_.find(oldMembers, function(oMember)
        {return oMember.userId == nMember.userId})))
        {
          res.status(404);
          res.json({
            "message": "Person with id: " + nMember.userId + " already in room"
          });
          return;
        }
      }

      var newMembers = oldMembers.concat(newMembers);
      targetRoom.updateRoom({"members": newMembers});
      targetRoom.saveRoom(function(err, updatedRoom) {
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

  removeMembersFromRoom: function(req, res) {
    if (helper.verifyBody(req, res, ['deleteMembers']))
      return;

    Room.getById(req.params.id, function(err, targetRoom) {
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

        var deleteMembers = req.body.deleteMembers;
        var currentMembers = targetRoom.get("members");
        var newMembers = _.filter(currentMembers, function(member)
          {
            return !(_.includes(deleteMembers, member.userId));
          });

        targetRoom.updateRoom({"members": newMembers});
        targetRoom.saveRoom(function(err, updatedRoom) {
          if (err){
            res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success"
            });
          }
        });
    });
  }
};
 
module.exports = RoomController;