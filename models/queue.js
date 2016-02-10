var mongoDB = require('../db/mymongo.js');

var queue = {
	createQueue: function(rid, queueMembers) {
		queueObj = 
			{
				"restaurantId" : rid,
				"queue" : queueMembers
    	};

		mongoDB.insert("queue", queueObj, callback);
	},

	allQueues: function(callback){
		mongoDB.find("queue", {}, callback);
	},

	findQueue: function(rid, callback){
		findObj = 
			{
				"restaurantId" : rid
			};

		mongoDB.find("queue", findObj, callback);
	},

	update: function(rid, newFields, callback){
		query = 
			{
				find: {
					"restaurantId" : rid
				},

				update: {
					$set: newFields
				}
			};

		mongoDB.update("queue", query, callback);
	},

	delete: function(rid, callback){
		deleteObj=
			{
				"restaurantId" : rid
			};

		mongoDB.remove("queue", deleteObj, callback);
	},

	addUserToQueue: function(rid, user, callback){
		updateObj =
			{
				find: {
					"restaurantId" : rid
				},

				update: {
	    		$push: { queue: user } 
	    	}
			};

		mongoDB.update("queue", updateObj, callback);
	},

	removeUserFromQueue: function(rid, userId, callback){
		updateObj =
			{
				find: {
					"restaurantId" : rid
				},

				update: {
	    		$pull: { queue: { userId : userId } }
	    	}
			};

		mongoDB.update("queue", updateObj, callback);
	}
};
 
module.exports = queue;