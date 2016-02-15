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

var MatchedUsers = new Schema({
  userId: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  firstName: String,
  lastName: String,
  nickname: String,
  job: String,
  isOpen: Boolean,
  expire: Date,
  img: String
})

var MatchSchema = new Schema({
  userId: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  matchList: [MatchedUsers]
});

//static methods for the "Location" model
MatchSchema.statics.getAll = function(callback){
  this.find(function(err, matches){
    if (err){
      callback(err, null);
    } else {
      callback(null, matches);
    }
  });
}

MatchSchema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundMatch){
    if (err) {
      return callback(err, null);
    } 

    if (foundMatch){
      return callback(null, foundMatch);
    } else {
      return callback(null, false);
    }
  });
}

module.exports = MatchSchema;