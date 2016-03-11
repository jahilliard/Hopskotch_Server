var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');
var User = require('../models/User.js');
var Message = require('../models/Message.js');
//TODO: can add check later that objectIds actually refer to exisitng objects
//using asynchrnous validators
function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

var ChatSchema = new Schema({
  user1: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  user2: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  }
})

ChatSchema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundChat){
    if (err) {
      return callback(err, null);
    } 

    if (foundChat){
      return callback(null, foundChat);
    } else {
      return callback(null, false);
    }
  });
}

ChatSchema.statics.markRead = function(messageIds, callback){
  console.log(messageIds);
  Message.update({'_id': {$in: messageIds}}, {$set: {isRead: true}}, {multi: true}, function(err, updateInfo){
    if (err){
      callback(err, null);
    } else {
      callback(null, updateInfo)
    }
  });
}

ChatSchema.statics.getChat = function(user1, user2, callback){
  this.findOne({$or: [{user1: user1, user2: user2}, {user1: user2, user2: user1}]},
    function(err, foundChat){
      if (err){
        callback(err, null);
      } else {
        callback(null, foundChat);
      }
    });
}

//gets chats you've participated in
ChatSchema.statics.getLatestChats = function(userId, callback){
  Message.aggregate()
  .match({"$or": [{to: userId}, {from: userId}]})
  .sort({date: -1})
  .group({_id: {chatId: "$chatId"}, to: {$first: "$to"}, from: {$first: "$from"},
    date: {$first: "$date"}, latestMsg: {$first: "$message"}, isRead: {$first: "$isRead"}})
  .exec(function(err, res){
    if (err) {
      callback(err, null);
    } else {
      var result = res.map(function(obj){
        if (obj.to != userId){
          delete obj.latestMsg;
          obj.chatee = obj.to;
        } else {
	  if (obj.isRead) {
	   delete obj.latestMsg;
	  }
          obj.chatee = obj.from;
        }

        obj.chatId = obj._id.chatId;
        delete obj._id;
        delete obj.from;
        delete obj.to;
        delete obj.isRead;
        return obj;
      });

      callback(null, result);
      return;
    }
  })
}

module.exports = ChatSchema;