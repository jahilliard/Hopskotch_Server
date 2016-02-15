var bcrypt = require('bcrypt-nodejs');
var schemas = {
	User: {
	  	firstName: null,
	  	lastName : null,
	    nickname: null,
	    role: null,
	  	email: null,
	  	password: null,
	  	fbId: null,
	  	phoneNum: null
  	},

  	Restaurant: {
  		_id: null,
  		name : null,
		mainImg : null,
		lat : null,
		lng : null,
		menu : []
  	},

  	Queue: {
  		_id: null,
  		restaurantId: null,
  		activeList: null
  	}
}

module.exports = schemas;