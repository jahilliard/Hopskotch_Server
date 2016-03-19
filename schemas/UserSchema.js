var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config.js');

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

function isValidMongoId(id){
  return mongoose.Types.ObjectId.isValid(id) || (id == "");
}

var UserSchema = new Schema({
	firstName: String,
	lastName : String,
  nickname: String,
  picture: Array,

  role: {
		type: String,
		default: "user"
	},

	email: {
		unique: true,
		type: String,
		validate: [validateEmail, 'Please fill a valid email address']
	},

	password: {
		type: String
	},

	fbId: {
    unique: true,
    type: String,
    sparse: true
  },

	phoneNum: String,

  currentCircle: {
    type: String,/*mongoose.Schema.Types.ObjectId,*/
    ref: 'Room',
    validate: [isValidMongoId, 'Not a valid ObjectId'],
    default: ""
  },
});

UserSchema.pre('save', function(next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(config.SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, null, function(err, hash) {
          if (err) return next(err);

          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
  });
});

//static methods for the "User" model

UserSchema.statics.getAll = function(callback){
  this.find(function(err, users){
    if (err){
      callback(err, null);
    } else {
      callback(null, users);
    }
  });
}

UserSchema.statics.getById = function(id, callback){
  this.findById(id, function(err, foundUser){
    if (err) {
      return callback(err, null);
    } 

    if (foundUser){
      return callback(null, foundUser);
    } else {
      return callback(null, false);
    }
  });
}

UserSchema.statics.getByFbId = function(fbId, callback){
  this.findOne({"fbId": fbId}, function(err, foundUser){
    if (err) {
      return callback(err, null);
    } 
    if (foundUser){
      return callback(null, foundUser);
    } else {
      return callback(null, false);
    }
  });
}

UserSchema.statics.getByEmail = function(email, callback){
  this.findOne({"email": email}, function(err, foundUser){
    if (err) {
      return callback(err, null);
    } 

    if (foundUser){
      return callback(null, foundUser);
    } else {
      return callback(null, false);
    }
  });
}

module.exports = UserSchema;