var mongoDB = require('../db/mymongo.js');
var bcrypt = require('bcrypt-nodejs');

var User = {

  attributes: {
  	firstName: "",
  	lastName : "",
    nickname: "",
  	email: "",
  	password: "",
  	fbId: "",
  	phoneNum: ""
  },

  allUsers: function(callback){
    mongoDB.find("user", {}, callback);
  },

  getOne: function(selector, callback){
    mongoDB.findOne("user", selector, callback);
  },

  fbSignUpUser: function(id){
    mongoDB.insert("user", {
        "id" : id
      }, function(err, newUser){
        if (err) {
          callback(err, null)
        } else {
          callback(null, newUser);
      };
    });
  },

  signUpUser: function(email, password, callback){
  	bcrypt.hash(password, null, null, function(err, hash) {
  		mongoDB.insert("user", {
    			"email" : email,
    			"passwordHash" : hash
    		}, function(newUser){
    			if (newUser) {
    				callback(newUser);
    			} else {
    				callback(false);
  			};
  		});
    });
  },

  loginUser: function(email, password, callback){
  	mongoDB.findOne("user", {
  		"email" : email
  	}, function(err, user){
      if (err){
        return callback(err, null);
      }
      if (user) {
  		  bcrypt.compare(password, user.passwordHash, function(err, res) {
  		  	if (err) {
            return callback(err, null);
          } else {
            return callback(null, user);
          }
  		  });
      } else {
        return callback(null, null);
      }
  	});
  },

  update: function(id, newFields, callback){
    query = 
    {
      find: {
        "_id": new ObjectID(id)
      },

      update: {
        $set: newFields
      }
    }

    mongoDB.update("user", query, function(err, user){
      callback(err, user);
    });
  },

  validateUser: function(email, callback){
    mongoDB.findOne("user", {
      "email" : email
    }, function(err, user){
      callback(err, user);
    });
  }
}


module.exports = User;