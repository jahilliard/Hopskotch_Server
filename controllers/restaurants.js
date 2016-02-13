var restaurant = require("../models/restaurant.js");
var helper = require("../helpers/helper.js");

var restaurants = {
  getAll: function(req, res) {
    restaurant.allRestaurants(function(err, restaurants){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "restaurants": restaurants});
      }
    });
  },
 
  getOne: function(req, res) {
    restaurant.findRestaurant(req.params.id, function(err, restaurant){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "restaurant": restaurant});
      }
    });
  },
 
  create: function(req, res) {
    helper.verifyBody(req, res, ['name', 'mainImg', 'lat', 'lng']);
    var menu = [];

    if ('menu' in req.body){
      menu = req.body.menu;
    }

    restaurant.createRestaurant(req.body.name, req.body.mainImg, 
      req.body.lat, req.body.lng, menu, function(err, newRestaurant){
        if (err){
          res.status(404);
          res.json({
            "errcode": err.code,
            "message": err.errmsg
          });
        } else {
          res.status(201);
          res.json({
            "newId": newRestaurant.insertedIds[0],
            "message": "success"
          });
        }
    });
  },
 
  update: function(req, res) {
    helper.verifyBody(req, res, ['fields']);
    restaurant.update(req.params.id, req.body.fields, function(err, status){
      if (err){
        res.status(404);
        res.json({
            "errcode": err.code,
            "message": err.errmsg
        });
      } else {
        res.status(200);
        res.json({"message": "success"});
      }
    });
  },
 
  delete: function(req, res) {
    restaurant.delete(req.params.id, function(err, deletedDoc){
      if (err){
        res.status(404);
        res.json({
            "errcode": err.code,
            "message": err.errmsg
        });
      } else {
        res.status(200);
        res.json({"message": "success"});
      }
    })
  },

  addMenuItems: function(req, res) {
    helper.verifyBody(req, res, ['newMenuItems']);
    restaurant.addMenuItems(req.params.id, req.body.newMenuItems, 
      function(err, updatedObjs){
        if (err){
          res.status(404);
          res.json({
              "errcode": err.code,
              "message": err.errmsg
          });
        } else {
          res.status(200);
          res.json({"message": "success"});
        }
      });
  },

  deleteMenuItems: function(req, res) {
    helper.verifyBody(req, res, ['oldMenuItems']);
    restaurant.deleteMenuItems(req.params.id, req.body.oldMenuItems, 
      function(err, deletedObjs){
        if (err){
          res.status(404);
          res.json({
            "errcode": err.code,
            "message": err.errmsg
          });
        } else {
          res.status(200);
          res.json({"message": "success"});
        }
      });
  }
};
 
module.exports = restaurants;