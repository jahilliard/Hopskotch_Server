var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');
var Chat = require('../models/Chat.js');
var User = require('../models/User.js');

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

module.exports = MessageSchema;