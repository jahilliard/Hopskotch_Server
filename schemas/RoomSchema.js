var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');
var User = require('../models/User.js');
var Location = require('../models/Location.js');

//TODO: can add check later that objectIds actually refer to exisitng objects
//using asynchrnous validators
function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

var RoomSchema = new Schema({
  properties: {
    name: String,
    mainImg: String,
    address: String,
    radius : {
      type: Number
    }
  },

  geometry: {
    coordinates: { type: [Number], index: '2dsphere'}
  }
});

//static methods for the "Location" model
RoomSchema.statics.getAll = function(callback){
  this.find(function(err, rooms){
    if (err){
      callback(err, null);
    } else {
      callback(null, rooms);
    }
  });
}

RoomSchema.statics.getAllMembers = function(circleId, callback){
  User
  .find()
  .where('currentCircle').equals(circleId)
  .exec(callback);
}

RoomSchema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundRoom){
    if (err) {
      return callback(err, null);
    } 

    if (foundRoom){
      return callback(null, foundRoom);
    } else {
      return callback(null, false);
    }
  });
}

RoomSchema.statics.getByLocationId = function(id, callback){
  this.findOne({"locationId": id}, function(err, foundRoom){
    if (err) {
      return callback(err, null);
    } 

    if (foundRoom){
      return callback(null, foundRoom);
    } else {
      return callback(new Error("No room with this id"), null);
    }
  });
}

RoomSchema.statics.checkInSameCircle = function(user1, user2){
  User.find({"_id" : { $in : [user1, user2] } }, function (err, results) {
    if (err || results.length < 2) {
      return false;
    } else {
      if (results[0].currentCircle != results[1].currentCircle) {
        return false;
      } else {
        return true;
      }
    }
  });
}

module.exports = RoomSchema;