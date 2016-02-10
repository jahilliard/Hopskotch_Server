var mongoDB = require('../db/mymongo.js');

var request = {
	createRequest: function(userId, matchList, callback) {
		requestObj = 
			{
				"userId" : userId,
				"matchList" : matchList
    	};

		mongoDB.insert("request", requestObj, callback);
	},

	allRequests: function(callback){
		mongoDB.find("request", {}, callback);
	},

	findRequest: function(userId, callback){
		findObj = 
			{
				"userId" : userId
			};

		mongoDB.find("request", findObj, callback);
	},

	update: function(userId, newFields, callback){
		query = 
			{
				find: {
					"userId" : userId
				},

				update: {
					$set: newFields
				}
			};

		mongoDB.update("request", query, callback);
	},

	delete: function(userId, callback){
		deleteObj =
			{
				"userId" : userId
			};

		mongoDB.remove("request", deleteObj, callback);
	},

	addMatch: function(userId, newMatch, callback){
		updateObj =
			{
				find: {
					"userId" : userId,
					"matchList.requesterId": { $ne: newMatch.requesterId } 
				},

				update: {
	    		$push: { matchList: newMatch } 
	    	}
			};

		mongoDB.update("request", updateObj, callback);
	},

	removeMatch: function(userId, deletedUserId, callback){
		updateObj =
			{
				find: {
					"userId" : userId
				},

				update: {
	    		$pull: { matchList: { userId : deletedUserId } }
	    	}
			};

		mongoDB.update("request", updateObj, callback);
	}
};
 
module.exports = request;