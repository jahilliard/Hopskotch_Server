var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');

var MenuItem = new Schema({
  name: String,
  price: Number
})

var LocationSchema = new Schema({
  name: String,
  mainImg: String,
  lat: Number,
  lng: Number,
  menu: [MenuItem]
});

//static methods for the "Location" model
LocationSchema.statics.getAll = function(callback){
  this.find(function(err, locations){
    if (err){
      callback(err, null);
    } else {
      callback(null, locations);
    }
  });
}

LocationSchema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundLocation){
    if (err) {
      return callback(err, null);
    } 

    if (foundLocation){
      return callback(null, foundLocation);
    } else {
      return callback(null, false);
    }
  });
}

module.exports = LocationSchema;