var mongoDB = require('../db/mymongo.js');
		ObjectID = require('mongodb').ObjectID;

var restaurant = {
	createRestaurant: function(name, mainImg, lat, lng, menu, callback) {
		docObj = 
			{
				"name" : name,
				"mainImg" : mainImg,
				"lat" : lat,
				"long" : lng,
				"menu" : menu
    	};

		mongoDB.insert("restaurant", docObj, callback);
	},

	allRestaurants: function(callback){
		mongoDB.find("restaurant", {}, callback);
	},

	findRestaurant: function(id, callback){
		findObj = 
			{
				"_id" : new ObjectID(id)
			};

		mongoDB.find("restaurant", findObj, callback);
	},

	restaurantsWithName: function(name, callback){
		findObj = 
			{
				"name" : name
			};	
		
		mongoDB.find("restaurant", findObj, callback);
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

		mongoDB.update("restaurant", query, callback);
	},

	delete: function(id, callback){
		deleteObj=
			{
				"_id" : new ObjectID(id)
			};

		mongoDB.remove("restaurant", deleteObj, callback);
	},

	addMenuItems: function(rid, newMenuItems, callback){
		updateObj =
		{
			find: {
				"_id": new ObjectID(rid)
			},

			update: {
    		$push: { menu: { $each: newMenuItems } } 
    	}
		}

		mongoDB.update("restaurant", updateObj, callback);
	},

	deleteMenuItems: function(rid, oldMenuItems, callback){
		updateObj =
		{
			find: {
				"_id": new ObjectID(rid)
			},

			update: {
    		$pull: { menu: { food : { $in: oldMenuItems } } }
    	}
		}

		mongoDB.update("restaurant", updateObj, callback)
	}
};
 
module.exports = restaurant;