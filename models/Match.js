var mongoose = require('mongoose');
var MatchSchema = require('../schemas/MatchSchema.js').schema;
var MatchEnum = require('../schemas/MatchSchema.js').MatchEnum;
var _ = require('lodash');

MatchSchema.methods.updateMatch = function(updatedFields){  
  var keys = Object.keys(updatedFields);
  var key = "";
  for (var i = 0; i < keys.length; i++){
    key = keys[i];
    this[key] = updatedFields[key]
  }
}

MatchSchema.methods.saveMatch = function(callback){
  this.save(function(err, match){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, match);
  });
},

MatchSchema.methods.delete = function(callback){
	this.remove(function(err, deletedMatch){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, deletedMatch);
  });
},

MatchSchema.methods.getValue = function(name){  
	return this[name];
}
 
module.exports = mongoose.model('Match', MatchSchema);