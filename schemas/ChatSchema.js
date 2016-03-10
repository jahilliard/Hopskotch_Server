var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');
var User = require('../models/User.js');

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

ChatSchema.statics.getChat = function(user1, user2, callback){
  //I think that User 2 might be an error
  this.find({$or: [{user1: user1, user2: user2}, {user1: user2, user2: user2}]},
    function(err, docs){
      if (err){
        callback(err, null);
      } else {
        callback(null, docs);
      }
    });
}

module.exports = ChatSchema;