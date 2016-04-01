var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');
var UserTrackerSchema = require('../schemas/UserTrackerSchema.js');

UserTrackerSchema.methods.saveLocation = function(callback){
  this.save(function(err, userLocation){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, userLocation);
  });
},
 
module.exports = mongoose.model('UserTracker', UserTrackerSchema);