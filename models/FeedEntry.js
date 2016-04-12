var mongoose = require('mongoose');
var FeedEntrySchema = require('../schemas/FeedEntrySchema.js').schema;
var _ = require('lodash');

FeedEntrySchema.methods.saveFeedEntry = function(callback){
  this.save(function(err, feedSchema){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, feedSchema);
  });
},

FeedEntrySchema.methods.delete = function(callback){
	this.remove(function(err, deletedFeedSchema){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, deletedFeedSchema);
  });
},

FeedEntrySchema.methods.getValue = function(name){  
	return this[name];
}
 
module.exports = mongoose.model('FeedEntry', FeedEntrySchema);