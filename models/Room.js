var mongoose = require('mongoose');
var RoomSchema = require('../schemas/RoomSchema.js');
var User = require("../models/User.js");
var _ = require('lodash');

RoomSchema.methods.updateRoom = function(updatedFields){  
  var keys = Object.keys(updatedFields);
  var key = "";
  for (var i = 0; i < keys.length; i++){
    key = keys[i];
    this[key] = updatedFields[key]
  }
}

RoomSchema.methods.saveRoom = function(callback){
  this.save(function(err, room){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, room);
  });
},

RoomSchema.methods.delete = function(callback){
	this.remove(function(err, deletedRoom){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, deletedRoom);
  });
},

RoomSchema.methods.getValue = function(name){  
	return this[name];
}

RoomSchema.methods.addMemberToRoom = function(userId, callback){
  var room = this;
  User.getById(userId, function(err, newMember) {
    if (err){
      callback(err, null);
    } 

    if (!newMember){
      callback(new Error("User does not exist"), null);
    }

    /*if (newMember.currentCircle != "" && newMember.currentCircle != room._id) {
      callback(new Error("Cannot join new circle without leaving old one"), null);
    }*/

    newMember.currentCircle = room._id;
    newMember.saveUser(function(err, savedUser){
      if (err){
        callback(err, null);
      } else {
        callback(null, savedUser)
      }
    });
  });
}

RoomSchema.methods.removeMemberFromRoom = function(userId, callback){
  var room = this;
  User.getById(userId, function(err, oldMember) {
    if (err){
      callback(err, null);
    } 

    if (!oldMember){
      callback(new Error("User does not exist"), null);
    }

    if (oldMember.currentCircle != room._id) {
      console.log(this._id);
      callback(new Error("Cannot leave circle user is not in"), null);
      return;
    }

    oldMember.currentCircle = "";
    oldMember.saveUser(function(err, savedUser){
      if (err){
        callback(err, null);
      } else {
        callback(null, savedUser)
      }
    });
  });
}
 
module.exports = mongoose.model('Room', RoomSchema);