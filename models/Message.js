var mongoose = require('mongoose');
var MessageSchema = require('../schemas/MessageSchema.js');
var _ = require('lodash');

MessageSchema.methods.saveMessage = function(callback){
  this.save(function(err, location){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, location);
  });
},
 
module.exports = mongoose.model('Message', MessageSchema);