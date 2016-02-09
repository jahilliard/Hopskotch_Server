var restaurant = require("../models/restaurant.js");

var restaurants = {
 
  getAll: function(req, res, next) {
    restaurant.allRestaurants(function(restaurants){
      res.json({"restaurants": restaurants});
    });
  },
 
  getOne: function(req, res, next) {
    restaurant.findRestaurant(req.params.id, function(restaurant){
      res.json({"restaurant": restaurant});
    });
  },
 
  create: function(req, res, next) {
    var menu = [];
    if ('menu' in req.body){
      menu = req.body.menu;
    }

    restaurant.createRestaurant(req.body.name, req.body.mainImg, 
      req.body.lat, req.body.lng, menu, function(newRestaurant){
        next(newRestaurant);
    });
  },
 
  update: function(req, res, next) {
    restaurant.update(req.params.id, req.body.fields, function(status){
      next(status);
    });
  },
 
  delete: function(req, res, next) {
    restaurant.delete(req.params.id, function(deletedDoc){
      next(deletedDoc);
    })
  }
};
 
module.exports = restaurants;