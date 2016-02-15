var mongoose = require('mongoose');
var RoomSchema = require('../schemas/RoomSchema.js');
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
 
module.exports = mongoose.model('Room', RoomSchema);