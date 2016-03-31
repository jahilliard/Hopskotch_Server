var _ = require('lodash');

var helper = require("../helpers/helper.js");
var User = require("../models/User.js");
var UserTracker = require('../models/UserTracker.js');

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  if (!("userId" in fields)) {
    res.status(401);
    res.json({
      "message": "cannot find userId field"
    });
    return 1;
  }

  else if (!("latitude" in fields)) {
    res.status(401);
    res.json({
      "message": "cannot find latitude field"
    })
    return 1;
  }

  else if (!("longitude" in fields)) {
    res.status(401);
    res.json({
      "message": "cannot find longitude field"
    })
    return 1;
  }

  else if (!("accuracyHorizontal" in fields)) {
	res.status(401);
    res.json({
      "message": "cannot find accuracyHorizontal field"
    })
    return 1;
  }

  else if (!("arrivalTime" in field)) {
  	res.status(401);
  	res.json({
  		"message": "cannot find arrivalTime field"
  	})
  	return 1;
  }

  else if (!("departureTime" in field)) {
  	res.status(401);
  	res.json({
  		"message": "cannot find departureTime field"
  	})
  	return 1;
  }

  return 0;
}

var UserTrackerController = {
 
  getAll: function(req, res) {
    UserTracker.getAll(function(err, locations){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "locations": locations});
      }
    });
  },
 
  getByUserId: function(req, res) {
    UserTracker.getByUserId(req.params.userId, function(err, locations){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "locations": locations});
      }
    });
  },

  saveLocation: function(req, res) { 
  	if (helper.verifyBody(req, res, ['locationInfo'])) {
      return;
    }

    var info = req.body.locationInfo;

    var tracker = new UserTracker(info);

  	tracker.saveLocation(function(err, locationSaved){
  		  if (err){
            res.status(404);
            return res.json({
              "message": err.message
            });
          } else {
            //notify people of new offers (include matchId!)
            res.status(201);
            return res.json({
              "message": locationSaved.id
            })
          }
  	});
  }
};
 
module.exports = UserTrackerController;