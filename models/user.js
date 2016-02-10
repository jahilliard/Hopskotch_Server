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
  	phoneNum: "",
  	accessToken: ""
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
  	}, function(user){
      if (user) {
  		  bcrypt.compare(password, user.passwordHash, function(err, res) {
  		  	if (err) {
            callback(true, null);
          } else {
            callback(null, user);
          }
  		  });
      } else {
        callback(true, null);
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