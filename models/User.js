var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');
var UserSchema = require('../schemas/UserSchema.js');

//non-static methods for model "User"

UserSchema.methods.checkPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    if (err) {
      return callback(err, null);
    } else {
      return callback(null, res);
    }
  });
}

UserSchema.methods.saveUser = function(callback) {
  this.save(function(err, user){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, user);
  });
}

UserSchema.methods.delete = function(callback){
  this.remove(function(err, deletedUser){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, deletedUser);
  });
}

UserSchema.methods.getValue = function(name) {  
  return this[name];
}

//callback just for err
UserSchema.methods.updateUser = function(updatedFields) {
  var keys = Object.keys(updatedFields);
  var key = "";
  for (var i = 0; i < keys.length; i++){
    key = keys[i];
    this[key] = updatedFields[key]
  }
}

module.exports = mongoose.model('User', UserSchema);