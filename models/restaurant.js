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

		mongoDB.insert("restaurant", docObj, function(newRestaurant){
			if (newRestaurant){
				callback(newRestaurant);
			} else {
				callback(false);
			}
		});
	},

	allRestaurants: function(callback){
		mongoDB.find("restaurant", {}, function(restaurants){
			if (restaurants){
				callback(restaurants);
			} else {
				callback(false);
			}
	  });
	},

	findRestaurant: function(id, callback){
		findObj = 
			{
				"_id" : new ObjectID(id)
			};

		mongoDB.find("restaurant", findObj, function(restaurant){
			if (restaurant){
				callback(restaurant);
			} else {
				callback(false);
			}
	  });
	},

	restaurantsWithName: function(name, callback){
		findObj = 
			{
				"name" : name
			};	
		
		mongoDB.find("restaurant", findObj, function(restaurants){
			if (restaurants){
				callback(restaurants);
			} else {
				callback(false);
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

		mongoDB.update("restaurant", query, function(deletedObjs){
			if(deletedObjs){
				callback(deletedObjs);
			} else {
				callback(false);
			}
		})
	},

	delete: function(id, callback){
		deleteObj=
			{
				"_id" : new ObjectID(id)
			};

		mongoDB.remove("restaurant", deleteObj, function(deletedDoc){
			if (deletedDoc){
				callback(deletedDoc);
			} else {
				callback(false);
			}
  	});
	}
};
 
module.exports = restaurant;