var Match = require("../models/Match.js");
var helper = require("../helpers/helper.js");
var _ = require('lodash');

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  return 0;
}

var MatchController = {
 
  getAll: function(req, res) {
    Match.getAll(function(err, matches){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "matches": matches});
      }
    });
  },
 
  getById: function(req, res) {
    Match.getById(req.params.id, function(err, match){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "match": match});
      }
    });
  },
 
  create: function(req, res) {
    if (helper.verifyBody(req, res, ['registrationInfo'])) {
      return;
    }
    var newMatch = new Match(req.body.registrationInfo);
    newMatch.saveMatch(function(err, newMatch){
      if (err){
        res.status(404);
        res.json({
          "message": err.message
        });
      } else {
        res.status(201);
        res.json({
          "newId": newMatch.id,
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

    Match.getById(req.params.id, function(err, targetMatch){
      if (err){
        res.status(404);
        res.json({
          "message": err.message
        });
        return;
      } 

      if (!targetMatch){
        res.status(404);
        res.json({
          "message": "Match with this id does not exist"
        });
        return;
      }

      targetMatch.updateMatch(fields);
      targetMatch.saveMatch(function(err, updatedMatch){
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
    Match.getById(req.params.id, 
      function(err, targetMatch) {
        if (err){
          res.status(404);
          res.json({                                                          
            "message": err.message
          });
          return;
        } 

        if (!targetMatch){
          res.status(404);
          res.json({
            "message": "Establishment with this id does not exist"
          });
          return;
        }

        targetMatch.delete(function(err, deletedMatch) {
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

  addMatches: function(req, res) {
    if (helper.verifyBody(req, res, ['newMatches'])) {
      return;
    }

    Match.getById(req.params.id, function(err, targetMatch) {
      if (err){
        res.status(404);
        res.json({
          "message": err.message
        });
        return;
      } 

      if (!targetMatch){
        res.status(404);
        res.json({
          "message": "Match with this id does not exist"
        });
        return;
      }

      var newMatches = req.body.newMatches;
      var oldMatches = targetMatch.get("matchList");

      //check for people whose userIds are already in the room
      for(var i = 0; i < newMatches.length; i++){
        var nMatch = newMatches[i];
        if(!_.isUndefined(_.find(oldMatches, function(oMatch)
        {return oMatch.userId == nMatch.userId})))
        {
          res.status(404);
          res.json({
            "message": "Person with id: " + nMatch.userId + " already in room"
          });
          return;
        }
      }

      var newMatches = oldMatches.concat(newMatches);
      targetMatch.updateMatch({"matchList": newMatches});
      targetMatch.saveMatch(function(err, updatedMatch) {
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

  removeMatches: function(req, res) {
    if (helper.verifyBody(req, res, ['deleteMatches'])) {
      return;
    }

    Match.getById(req.params.id, function(err, targetMatch) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!targetMatch){
          res.status(404);
          res.json({
            "message": "Establishment with this id does not exist"
          });
          return;
        }

        var deleteMatches = req.body.deleteMatches;
        var currentMatches = targetMatch.get("matchList");
        var newMatchList = _.filter(currentMatches, function(match)
          {
            return !(_.includes(deleteMatches, match.userId));
          });

        targetMatch.updateMatch({"matchList": newMatchList});
        targetMatch.saveMatch(function(err, updatedMatches) {
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
 
module.exports = MatchController;