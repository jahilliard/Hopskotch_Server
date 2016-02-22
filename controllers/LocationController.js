var Location = require("../models/Location.js");
var helper = require("../helpers/helper.js");
var _ = require('lodash');

function validateFields(fields, req, res){
  return 0;
}

function getProps(fields){
  return _.pick(fields, ['name', 'mainImg', 'menu']);
}

function getGeom(fields){
  return _.pick(fields, ['coordinates']);
}

var LocationController = {

  getAll: function(req, res) {
    Location.getAll(function(err, locations){
      if(err){
        res.status(404);
        res.json({"message": err.message});
      } else {
        res.status(200);
        res.json({"message": "success", "locations": locations});
      }
    });
  },
 
  getById: function(req, res) {
    Location.getById(req.params.id, 
      function(err, location){
        if(err){
          res.status(404);
          res.json({"message": err.message});
        } else {
          res.status(200);
          res.json({"message": "success", "location": location});
        }
      });
  },
 
  create: function(req, res) {
    if (helper.verifyBody(req, res, ['registrationInfo'])) {
      return;
    }

    if (validateFields(req.body.registrationInfo, req, res)) {
      return;
    }

    var props = getProps(req.body.registrationInfo);
    var geom = getGeom(req.body.registrationInfo);
    console.log(props);
    console.log(geom);
    var newLocation = new Location({properties: props, geometry: geom});
    newLocation.saveLocation(function(err, newLocation){
      if (err){
        console.log(err);
        res.status(404);
        res.json({
          "message": err.message
        });
      } else {
        res.status(201);
        res.json({
          "newId": newLocation.id,
        });
      }
    }); 
  },
 
  update: function(req, res) {
    if(helper.verifyBody(req, res, ['fields'])){
      return;
    }

    var fields = req.body.fields;

    if(validateFields(fields, req, res)){
      return;
    }

    Location.getById(req.params.id, function(err, targetLocation){
      if (err){
        res.status(404);
        res.json({
          "message": err.message
        });
        return;
      } 

      if (!targetLocation){
        res.status(404);
        res.json({
          "message": "Establishment with this id does not exist"
        });
        return;
      }

      targetLocation.updateLocation(fields);
      targetLocation.saveLocation(function(err, updatedLocation){
        if(err){
          res.status(404);
          res.json({
            "message": err.message
          });
        } else {
          res.status(200);
          res.json({
            "message": "success"
          })
        }
      });
    })
  },
 
  delete: function(req, res) {
    Location.getById(req.params.id, 
      function(err, targetLocation) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!targetLocation){
          res.status(404);
          res.json({
            "message": "Establishment with this id does not exist"
          });
          return;
        }

        targetLocation.delete(function(err, deletedLocation) {
          if (err){
            res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success"
            })
          }
        });
    });
  },

  addMenuItems: function(req, res) {
    if (helper.verifyBody(req, res, ['newMenuItems'])) {
      return;
    }

    Location.getById(req.params.id, 
      function(err, targetLocation) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!targetLocation){
          res.status(404);
          res.json({
            "message": "Establishment with this id does not exist"
          });
          return;
        }

        var newMenuItems = req.body.newMenuItems;

        
        var oldMenu = targetLocation.get("menu");

        //check for items whose names are already on the menu
        for(var i = 0; i < newMenuItems.length; i++){
          var nItem = newMenuItems[i];
          if(!_.isUndefined(_.find(oldMenu, function(oItem)
          {return oItem.name == nItem.name})))
          {
            res.status(404);
            res.json({
              "message": "Menu item with name: " + nItem.name + " already exists"
            });
            return;
          }
        }

        var newMenu = oldMenu.concat(newMenuItems);
        targetLocation.updateLocation({"menu": newMenu});
        targetLocation.saveLocation(function(err, updatedLocation) {
          if (err){
            res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success"
            })
          }
        });
    });
  },

  //radius in meters
  getInRadius: function(req, res){
    if (helper.verifyRequest(req, res, ['location', 'radius'])){
      return;
    }

    Location.getInRadius(req.query.location, req.query.radius, 
      function(err, foundLocations){
        if (err){
          res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success",
              "locations": foundLocations
            })
          }
      })
  },

  deleteMenuItems: function(req, res) {
    if (helper.verifyBody(req, res, ['oldMenuItems'])){
      return;
    }

    Location.getById(req.params.id, 
      function(err, targetLocation) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!targetLocation){
          res.status(404);
          res.json({
            "message": "Establishment with this id does not exist"
          });
          return;
        }

        var oldMenuItemNames = req.body.oldMenuItems;
        var oldMenu = targetLocation.get("menu");
        var newMenu = _.filter(oldMenu, function(item)
          {
            return !(_.includes(oldMenuItemNames, item.name));
          });
        targetLocation.updateLocation({"menu": newMenu});
        targetLocation.saveLocation(function(err, updatedLocation) {
          if (err){
            res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success"
            });
          }
        });
    });
  }
};
 
module.exports = LocationController;