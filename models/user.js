var mongoDB = require('../db/mymongo.js');
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');
var schemas = require('../schemas/schemas.js');

var User = function(data) {
  this.data = this.sanitize(data);
}

User.prototype.sanitize = function(data) {  
  data = data || {};
  schema = schemas.User;
  return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

User.prototype.hashPassword = function(callback) {
  if(this.data.password != null) {
    var self = this;
    bcrypt.hash(this.data.password, null, null, function(err, hash) {
      if (err) {
        return callback(err);
      } else {
        self.data.password = hash;
        callback(null);
      }
    });
  } else {
    callback(null);
  }
}

User.prototype.getAllUsers = function(callback){
  mongoDB.find("user", {}, callback);
}

User.prototype.getById = function(id, callback){
  mongoDB.findOne("user", {"_id": new ObjectID(id)}, 
    function(err, foundUserData){
      if (err) {
        return callback(err, null);
      } 

      if (foundUserData){
        var newUser = new User();
        newUser.data = foundUserData;
        return callback(null, newUser);
      } else {
        return callback(null, false);
      }
    });
}

User.prototype.getByFbId = function(fbId, callback){
  mongoDB.findOne("user", {"fbId": fbId}, 
    function(err, foundUserData){
      if (err) {
        return callback(err, null);
      } 

      if (foundUserData){
        var newUser = new User();
        newUser.data = foundUserData;
        return callback(null, newUser);
      } else {
        return callback(null, false);
      }
    });
}

User.prototype.getByEmail = function(email, callback){
  mongoDB.findOne("user", {"email": email},     
    function(err, foundUserData){
      if (err) {
        return callback(err, null);
      } 

      if (foundUserData){
        var newUser = new User();
        newUser.data = foundUserData;
        return callback(null, newUser);
      } else {
        return callback(null, false);
      }
    });
}

User.prototype.checkPassword = function(password, callback) {
  console.log(this.data);
  bcrypt.compare(password, this.data.password, function(err, res) {
    if (err) {
      return callback(err, null);
    } else {
      return callback(null, res);
    }
  });
}

User.prototype.validateUser = function(callback) {
  var err = new Error;
  if (this.data.email == null) {
    err.errmsg = "Missing email";
    return callback(err);
  }

  else if (this.data.password == null) {
    err.errmsg = "Missing password";
    return callback(err);
  }

  callback(null);
}

User.prototype.create = function(callback) {
  var self = this;

  this.validateUser(function(err) {
    if (err) {
      return callback(err, null);
    } else {
      mongoDB.insert("user", this.data, function(err, newUser){
        if (err) {
          return callback(err, null);
        } 

        //update the id we got
        self.data.id = newUser.ops[0].id;
        return callback(null, newUser);
      });
    }
  });
}

User.prototype.save = function(callback){
  this.data = this.sanitize(this.data);
  if (this.data._id != null) {
    var query = 
    {
      find: {
        "_id":  new ObjectID(this.data._id)
      },

      update: {
        $set: this.data
      }
    };

    mongoDB.update("user", query, function(err, user){
      console.log("UPDATING");
      console.log(user);
      if (err) {
        return callback(err, null);
      } 

      if (user){
        return callback(null, user);
      }
    });

    return;
  }

  this.create(callback);
},

User.prototype.delete = function(callback){
  var deleteObj = 
  {
    "_id":  new ObjectID(this.data._id)
  }

  mongoDB.remove("user", deleteObj, function(err, deletedUser){
    if (err) {
      return callback(err, null);
    } 

    return callback(null, deletedUser);
  });
},

User.prototype.get = function (name) {  
  return this.data[name];
}

//callback just for err
User.prototype.update = function (updatedFields, callback) {  
  _.defaults(updatedFields, this.data);
  this.data = this.sanitize(updatedFields);
  var self = this;
  if(updatedFields.password != null) {
    bcrypt.hash(updatedFields.password, null, null, function(err, hash) {
      if (err) {
        callback(err);
        return;
      }
      self.data.password = hash;
      callback(null);
    });
  }
}

module.exports = User;