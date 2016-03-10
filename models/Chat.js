var mongoose = require('mongoose');
var ChatSchema = require('../schemas/ChatSchema.js');
var Message = require('../models/Message.js');
var _ = require('lodash');


ChatSchema.methods.saveChat = function(callback){
  this.save(function(err, location){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, location);
  });
},
 
ChatSchema.methods.getUnreadMessages = function(userId, callback){
	Message.getChatUnreadMessages(this._id, userId, callback);
}

module.exports = mongoose.model('Chat', ChatSchema);