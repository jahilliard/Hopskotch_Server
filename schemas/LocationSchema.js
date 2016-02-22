var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');

var MenuItem = new Schema({
  name: String,
  price: Number
})

var LocationSchema = new Schema({
  properties: {
    name: String,
    mainImg: String,
    menu: [MenuItem]
  },

  geometry: {
    coordinates: { type: [Number], index: '2dsphere'}
  }
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

LocationSchema.statics.getByName = function(name, callback){
  this.findOne({"name": name}, function(err, foundLocation){
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

//radius in meters
LocationSchema.statics.getInRadius = function(location, radius, callback){
  this.find(
    { "geometry.coordinates": {
        $nearSphere: {
          $geometry: {
            type : "Point",
            coordinates : location
          },
          $minDistance: 0,
          $maxDistance: parseFloat(radius)
        }
      }
    }, function(err, foundLocations){
      if (err){
        callback(err, null);
      } else{
        callback(null, foundLocations);
      }
    })
}

module.exports = LocationSchema;