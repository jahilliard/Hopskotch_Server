var mongoose = require('mongoose');
var ChatSchema = require('../schemas/ChatSchema.js');
var _ = require('lodash');

ChatSchema.methods.saveChat = function(callback){
  this.save(function(err, location){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, location);
  });
},
 
module.exports = mongoose.model('Chat', ChatSchema);