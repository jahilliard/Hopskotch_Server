var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');
var config = require('../config/config.js');
var User = require('../models/User.js');

function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

var MatchSchema = {
  MatchEnum : {
    Heart : 0,
    Drink : 1
  },

  //TODO: can add check later that objectIds actually refer to exisitng objects
  //using asynchronous validators
  schema : null
};

//initialize the schema
MatchSchema.schema = new Schema({
  userId1: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  userId2: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  user1Offers: [Number],
  user2Offers: [Number]
});

//ensure unique userId1, userId2
MatchSchema.schema.index({ userId1: 1, userId2: 1}, { unique: true });

//static methods for the "Location" model
MatchSchema.schema.statics.getAll = function(callback){
  this.find(function(err, matches){
    if (err){
      callback(err, null);
    } else {
      callback(null, matches);
    }
  });
}

MatchSchema.schema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundMatch){
    if (err) {
      return callback(err, null);
    } 

    if (foundMatch){
      return callback(null, foundMatch);
    } else {
      return callback(new Error("No match with this id"), false);
    }
  });
}

MatchSchema.schema.statics.getMatchesForUser = function(userId, others, callback){
  var query = {$or: [{'userId1': userId,  'userId2': {$in: others}}, {'userId2': userId,  'userId1': {$in: others}}]};
  this.find(query, function(err, results){
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

MatchSchema.schema.statics.getMatchByCriteria = function(criteria, callback){
  var userId1 = null;
  var userId2 = null;
  var user1Offers = null;
  var user2Offers = null;

  var query = {};
  if ('userId1' in criteria){
    query.userId1 = criteria.userId1;
  } 

  if ('userId2' in criteria){
    query.userId2 = criteria.userId2;
  } 

  if ('user1Offers' in criteria){
    query.user1Offers = criteria.user1Offers;
  } 

  if ('user2Offers' in criteria){
    query.user2Offers = criteria.user2Offers;
  } 

  this.find(query, function(err, matches){
    if (err){
      callback(err, null);
    } else {
      callback(null, matches);
    }
  });
}

MatchSchema.schema.statics.isValidOfferOption = function(value){
  if(_.isUndefined(_.findKey(MatchSchema.MatchEnum, function(i) { return i == value; }))){
    return false;
  }

  return true;
}

module.exports = MatchSchema;