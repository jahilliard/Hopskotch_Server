var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');
//var mongoosePaginate = require('mongoose-paginate');

function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

var ChatSchema = new Schema({
  userId: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'User',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  }, 

  locationName: String,

  checkInTime: Date,

  roomId: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'Room',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

  locationId: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'Room',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

})

CheckInSchema.plugin(mongoosePaginate);

CheckInSchema.statics.getByPage = function(page, callback){
  /*this.paginate({}, {limit: 25, page: page, sort: {date: -1}, function(err, feedObjects){
    if (err) {
      return callback(err, null);
    } else {
      return callback(null, feedObjects);
    }
  })*/
}


module.exports = CheckInSchema;