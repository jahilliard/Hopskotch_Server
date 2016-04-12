var mongoose = require('mongoose');
var CheckInSchema = require('../schemas/CheckInSchema.js');
var _ = require('lodash');

CheckInSchema.methods.saveCheckIn = function(callback){
  this.save(function(err, checkIn){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, checkIn);
  });
},
 
module.exports = mongoose.model('CheckIn', CheckInSchema);