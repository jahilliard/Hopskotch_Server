var mongoDB = require('../db/mymongo.js');
var bcrypt = require('bcrypt-nodejs');

var User = {

  attributes: {
  	firstName: "",
  	lastName : "",
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

validateUser: function(email, password, callback){
	mongoDB.findOne("user", {
		"email" : email
	}, function(user){
		bcrypt.compare(password, user.hash, function(err, res) {
			if (res) {
        callback(user);
      } else {
        callback(false);
      }
		});
	});
}
 

}


module.exports = User;