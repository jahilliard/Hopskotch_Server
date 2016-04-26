var Match = require("../models/Match.js");
var Room = require("../models/Room.js")
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
  update: function(req, res) {
    if (helper.verifyBody(req, res, ["fields.offers"])) {
      return;
    }

    var fields = req.body.fields;
    var criteria = {};
    var isNew = false;

    var otherUser = req.params.userId2;
    var myId = req.params.userId1;

    if (myId != req.body.id) {
      res.status(404);
      res.json({
        "message": "Not Authorized to modify this user"
      });

      return;
    }

    if (!Room.checkInSameCircle(myId, otherUser)) {
      res.status(404);
      res.json({
        "message": "Not in same circle, cannot update offers"
      });
      return;
    }

    if (otherUser < myId){
      criteria.userId1 = otherUser;
      criteria.userId2 = myId;
    } else {
      criteria.userId1 = myId;
      criteria.userId2 = otherUser;
    }

    Match.getMatchByCriteria(criteria, function(err, foundMatchArray) {
      if (err){
        res.status(404);
        res.json({
          "message": err.message
        });
        return;
      } 

      var targetMatch = null;
      if (foundMatchArray.length == 0){
        //create new match object
        var targetMatch = new Match();
        targetMatch.userId1 = criteria.userId1;
        targetMatch.userId2 = criteria.userId2;
        isNew = true;
      } 

      /*else if (!("offers" in info) || info.offers.length == 0) {
        res.status(200);
        res.json({
          "message": "success",
          "matchId": targetMatch.id
        });

        return;
      }*/ 

      else {
        targetMatch = foundMatchArray[0];
      }


      if ("offers" in fields && fields.offers.length > 0) {
        MatchController.updateOffers(fields.offers, req.body.id, targetMatch, function(newOffers, newMatch, otherUser){
          newMatch.saveMatch(function(err, savedMatch){
            if (err){
              res.status(404);
              res.json({
                "message": err.message
              });
            } else {
              //notify people of new offers (include matchId!)
              Socket.sendNewOffers(myId, otherUser, targetMatch._id, newOffers);
              res.status(200);
              res.json({
                "message": "success",
                "matchId": savedMatch._id
              });
            }
          });
        });
      } 

      else if (isNew) {
        targetMatch.saveMatch(function(err, savedMatch) {
          if (err){
            res.status(404);
            res.json({
              "message": err.message
            });
          } else {
            res.status(200);
            res.json({
              "message": "success",
              "matchId": savedMatch._id
            });
          }
        });
      }

      else {
        res.status(200);
        res.json({
          "message": "success",
          "matchId": targetMatch._id
        });
      }

    });
  },
 
  updateOffers: function(offers, offeringUserId, match, callback){
    var otherUser = null;
    if (match.userId1 == offeringUserId){
        currentOffers = match.user1Offers;
        otherUser = match.userId2;
      } else {
        currentOffers = match.user2Offers;
        otherUser = match.userId1;
      }

      //filter out the gibberish
      offers = _.filter(offers, function(value){return Match.isValidOfferOption(value)});

      //see if there is any new offers
      var difference = _.difference(offers, currentOffers);

      if(difference.length > 0){
        var newOffers = currentOffers.concat(difference);
        if (match.userId1 == offeringUserId){
          match.user1Offers = newOffers;
        } else {
          match.user2Offers = newOffers;
        }

        callback(difference, match, otherUser);
      } else {
        callback([], match, otherUser);
      }
  },

  /*update: function(req, res) {
    if(helper.verifyBody(req, res, ['fields.offers'])){
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

      MatchController.updateOffers(offers, req.body.id, foundMatch, function(newOffers, newMatch, otherUser){
        if(newOffers.length > 0){
          foundMatch.saveMatch(function(err, savedMatch){
            if (err){
              res.status(404);
              return res.json({
                "message": err.message
              });
            } else {
              //notify people of new offers (include matchId!)
              Socket.sendNewOffers(req.body.id, otherUser, savedMatch._id, newOffers);
              res.status(200);
              return res.json({
                "message": "success"
              })
            }
          });
        } else {
          res.status(200);
          return res.json({
            "message": "success"
          });
        }
      });
    })
  },*/
 
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