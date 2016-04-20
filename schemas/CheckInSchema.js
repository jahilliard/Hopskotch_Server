var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');

function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id);
}

var CheckInSchema = new Schema({
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
    ref: 'Location',
    required: true,
    validate: [isValidMongoId, 'Not a valid ObjectId']
  },

});


module.exports = CheckInSchema;