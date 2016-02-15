var mongoose = require('mongoose');
var LocationSchema = require('../schemas/LocationSchema.js');
var _ = require('lodash');

LocationSchema.methods.updateLocation = function(updatedFields){  
  var keys = Object.keys(updatedFields);
  var key = "";
  for (var i = 0; i < keys.length; i++){
    key = keys[i];
    this[key] = updatedFields[key]
  }
}

LocationSchema.methods.saveLocation = function(callback){
  this.save(function(err, location){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, location);
  });
},

LocationSchema.methods.delete = function(callback){
	this.remove(function(err, deletedLocation){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, deletedLocation);
  });
},

LocationSchema.methods.getValue = function(name){  
	return this[name];
}
 
module.exports = mongoose.model('Location', LocationSchema);