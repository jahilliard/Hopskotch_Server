var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');
var User = require('../models/User.js');
var Room = require('../models/Room.js');

//TODO: can add check later that objectIds actually refer to exisitng objects
//using asynchrnous validators
function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

var FeedEntrySchema = {
  FeedEnum : {
    PlainText: 0,
    Image : 1,
    Video: 2
  },

  //TODO: can add check later that objectIds actually refer to exisitng objects
  //using asynchronous validators
  schema : null
}

FeedEntrySchema.schema = new Schema({
  roomId: {
    type: String,
    ref: 'Room',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  userId: {
    type: String, /*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  date: Date,

  text: {
    type: String
  },

  entryType: {
    type: Number,
    required: true
  },

  data: {
    type: Buffer
  }
});

//static methods for the "Location" model
FeedEntrySchema.schema.statics.getAll = function(callback){
  this.find(function(err, rooms){
    if (err){
      callback(err, null);
    } else {
      callback(null, rooms);
    }
  });
}

FeedEntrySchema.schema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundFeedEntry){
    if (err) {
      return callback(err, null);
    } 

    if (foundFeedEntry){
      return callback(null, foundFeedEntry);
    } else {
      return callback(new Error("No feedEntry with this id"), false);
    }
  });
}

FeedEntrySchema.schema.statics.findNewest = function(roomId, earliestDate, limit, callback){
  console.log(earliestDate);
  this.count({"roomId": roomId, "date": {"$gt": earliestDate}}, function(err, count) {
    if (err) {
      callback(err, null);
      return;
    }

    console.log('Update count is ' + count);
    this.find({"roomId": roomId, "date": {"$gt": earliestDate}})
    .sort([["date", "descending"]])
    .limit(limit)
    .exec(function(err, entries){
      if (err) {
        callback(err, null, null);
      } else {
        console.log("ENTRIES LENGTH")
        console.log(entries.length);
        callback(null, entries, count);
      }
    });
  });
}

FeedEntrySchema.schema.statics.getFeedEntryUpdates = function(roomId, earliestDate, limit, callback){
  this.count({"roomId": roomId, "date": {"$gt": earliestDate}}, function(err, count) {
    if (err) {
      callback(err, null, null);
      return;
    }
    this.find({"roomId": roomId, "date": {"$gt": earliestDate}})
    .sort([["date", "ascending"]])
    .limit(limit)
    .exec(function(err, entries){
      if (err) {
        callback(err, null, null);
      } else {
        console.log("HERE");
        console.log(earliestDate);
        console.log(entries);
        callback(null, entries, count);
      }
    });
  });
}

FeedEntrySchema.schema.statics.findOlderByTime = function(date, roomId, limit, callback){
  this.count({"roomId": roomId, "date": {"$lt": date}}, function(err, count) {
    if (err) {
      callback(err, null, null);
      return;
    }

    this.find({"roomId": roomId, "date": {"$lt": date}})
    .sort([["date", "descending"]])
    .limit(limit)
    .exec(function(err, entries){
      if (err) {
        callback(err, null, null);
      } else {
        callback(null, entries, count);
      }
    });
  });
}

FeedEntrySchema.schema.statics.findInRange = function(earlyDate, lateDate, roomId, limit, callback){
  this.count({"roomId": roomId, "date": {"$gt": earlyDate, "$lt": lateDate}}, function(err, count) {
    if (err) {
      callback(err, null);
      return;
    }

    console.log('Count is ' + count);
    this.find({"roomId": roomId, "date": {"$gt": earlyDate}, "$lt": lateDate})
    .sort([["date", "descending"]])
    .limit(limit)
    .exec(function(err, entries){
      if (err) {
        callback(err, null, null);
      } else {
        callback(null, entries, count);
      }
    });
  });
}

FeedEntrySchema.schema.statics.getByLocationId = function(id, callback){
  this.findOne({"roomId": id}, function(err, foundFeedEntry){
    if (err) {
      return callback(err, null);
    } 

    if (foundFeedEntry){
      return callback(null, foundFeedEntry);
    } else {
      return callback(null, false);
    }
  });
}

module.exports = FeedEntrySchema;