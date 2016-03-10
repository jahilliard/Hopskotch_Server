var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');
var Chat = require('../models/Chat.js');
var User = require('../models/User.js');

//TODO: ADD SHARDING for faster search

//TODO: can add check later that objectIds actually refer to exisitng objects
//using asynchrnous validators
function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

var MessageSchema = new Schema({
  chatId: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'Chat',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  date: Date,

  isRead: Boolean,

  from: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  to: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  message: String
})

MessageSchema.statics.getChatUnreadMessages = function(chatId, userId, callback){
  var query = this.find({});
  query.where("chatId", chatId);
  query.where("isRead", false);
  query.where("to", userId);
  query.sort([["date", "descending"]]);

  query.exec(function(err, docs){
    if (err){
      callback(err, null);
    } else {
      callback(null, docs);
    }
  });
}

module.exports = MessageSchema;