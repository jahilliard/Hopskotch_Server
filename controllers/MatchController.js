var Match = require("../models/Match.js");
var helper = require("../helpers/helper.js");
var _ = require('lodash');
var Socket = require('../ws/ws.js');

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
 
  //creates a new chat if one with userId1 = req.body.id and 
  //userId2 = req.body.registrationInfo.otherUser (or vice versa)
  //does not already exist
  createIfNotExists: function(req, res) {
    if (helper.verifyBody(req, res, ['registrationInfo'])) {
      return;
    }

    var info = req.body.registrationInfo;
    var criteria = {};

    if (info.otherUser < req.body.id){
      criteria.userId1 = info.otherUser;
      criteria.userId2 = req.body.id;
    } else {
      criteria.userId1 = req.body.id;
      criteria.userId2 = info.otherUser;
    }

    Match.getMatchByCriteria(criteria, function(err, foundMatchArray) {
      if (err){
        res.status(404);
        res.json({
          "message": err.message
        });
        return;
      } 

      if (foundMatchArray.length == 0){
        //create new match object
        var newMatch = new Match();

        newMatch.userId1 = criteria.userId1;
        newMatch.userId2 = criteria.userId2;

        newMatch.saveMatch(function(err, newMatch){
          if (err){
            res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(201);
            res.json({
              "matchId": newMatch.id,
            });
          }
        });
        return;
      } else {
        res.status(200);
        res.json({
          "matchId": foundMatchArray[0].id,
        });
        return;
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

    Match.getById(req.params.id, function(err, foundMatch){
      if (err){
        res.status(404);
        res.json({
          "message": err.message
        });
        return;
      } 

      if (!foundMatch){
        res.status(404);
        res.json({
          "message": "Match with this id does not exist"
        });
        return;
      }

      var offers = req.body.fields.offers;
      var currentOffers = null;
      var otherUser = null;

      if (foundMatch.userId1 == req.body.id){
        currentOffers = foundMatch.user1Offers;
        otherUser = foundMatch.userId2;
      } else {
        currentOffers = foundMatch.user2Offers;
        otherUser = foundMatch.userId1;
      }

      //filter out the gibberish
      offers = _.filter(offers, function(value){return Match.isValidOfferOption(value)});
      //see if there is any new offers
      var difference = _.difference(offers, currentOffers);

      if(difference.length > 0){
        newOffers = currentOffers.concat(difference);
        if (foundMatch.userId1 == req.body.id){
          foundMatch.user1Offers = newOffers;
        } else {
          foundMatch.user2Offers = newOffers;
        }

        foundMatch.saveMatch(function(err, savedMatch){
          if (err){
            res.status(404);
            return res.json({
              "message": err.message
            });
          } else {
            //notify people of new offers (include matchId!)
            Socket.sendNewOffers(req.body.id, otherUser, req.params.id, difference);
            res.status(200);
            return res.json({
              "message": "success"
            })
          }
        })
      } else {
        res.status(200);
        return res.json({
          "message": "success"
        })
      }
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
  }

  //each match has "otherUser" field designating which userId the offers are for
  /*addMatches: function(req, res) {
    if (helper.verifyBody(req, res, ['newMatches'])) {
      return;
    }

    var newMatches = req.body.newMatches;

    for (int i = 0; i < newMatches.length; i++){
      var singleMatch = newMatches[i];
      var otherUser =  singleMatch.otherUser;
      var user = singleMatch.user;
      var criteria = {};
      criteria.otherUser = otherUser;
      criteria.user = user;

      Match.getMatchByCriteria(criteria, function(err, foundMatch) {
        if (err){
          res.status(404);
          res.json({
            "message": err.message
          });
          return;
        } 

        if (!foundMatch){
          //create new match object
          var newMatch = new Match();
          newMatch.userId1 = user;
          newMatch.userId2 = otherUser;
          newMatch.user1Offers = singleMatch.offers;
          newMatch.saveMatch(function(err, newMatch){
            if (err){
              res.status(404);
              return res.json({
                "message": err.message
              });
            } else {
              res.status(200);
              return res.json({
                "message": "success"
              })
            }
          });
        } else {
          var currentOffers = null;
          if (foundMatch.userId1 == user){
            currentOffers = foundMatch.user1Offers;
          } else {
            currentOffers = foundMatch.user2Offers;
          }

          //see if there is any new offers
          if(_.difference(offers, currentOffers).length > 0){
            if (foundMatch.userId1 == user){
              foundMatch.user1Offers = offers;
            } else {
              foundMatch.user2Offers = offers;
            }
            foundMatch.saveMatch(function(err, savedMatch){
              if (err){
                res.status(404);
                return res.json({
                  "message": err.message
                });
              } else {
                //notify people of new offers
                res.status(200);
                return res.json({
                  "message": "success"
                })
              }
            })
          }
        }
      });
    }
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
  }*/
};
 
module.exports = MatchController;