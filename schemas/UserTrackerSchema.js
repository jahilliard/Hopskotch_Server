var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');

function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id) || (id == "");
}

var UserTrackerSchema = new Schema({
  userId: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  latitude: Number,
  longitude: Number,

  arrivalTime: Date,
  departureTime: Date,

  accuracyHorizontal: Number
});

//static methods for the "User" model

UserTrackerSchema.statics.getAll = function(callback){
  this.find(function(err, userLocations){
    if (err){
      callback(err, null);
    } else {
      callback(null, userLocations);
    }
  });
}

UserTrackerSchema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundUserLocation){
    if (err) {
      return callback(err, null);
    } 

    if (foundUser){
      return callback(null, foundUserLocation);
    } else {
      return callback(new Error("No userTracker with this id"), null);
    }
  });
}

UserTrackerSchema.statics.getByUserId = function(userId, callback){
  this.findOne({"userId": userId}, function(err, foundUserLocation){
    if (err) {
      return callback(err, null);
    } 
    if (foundUser){
      return callback(null, foundUserLocation);
    } else {
      return callback(null, false);
    }
  });
}

module.exports = UserTrackerSchema;