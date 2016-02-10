var request = require("../models/request.js");
var helper = require("../helpers/helper.js");

var requests = {
 
  getAll: function(req, res) {
    request.allRequests(function(err, requests){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "requests": requests});
      }
    });
  },
 
  getOne: function(req, res) {
    request.findRequest(req.params.id, function(err, request){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "request": request});
      }
    });
  },
 
  create: function(req, res) {
    helper.verifyBody(req, res, ['userId']);
    var matchList = [];

    if ('matchList' in req.body){
      matchList = req.body.matchList;
    }

    request.createRequest(req.body.userId, matchList, 
      function(err, newRequest){
        if (err){
          res.status(404);
          res.json({
            "errcode": err.code,
            "message": err.errmsg
          });
        } else {
          res.status(201);
          res.json({
            "newId": req.body.userId,
            "message": "success"
          });
        }
    });
  },
 
  update: function(req, res) {
    helper.verifyBody(req, res, ['fields']);
    request.update(req.params.id, req.body.fields, function(err, status){
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
    request.delete(req.params.id, function(err, deletedDoc){
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

  addMatch: function(req, res) {
    helper.verifyBody(req, res, ['newMatch']);
    request.addMatch(req.params.id, req.body.newMatch, 
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

  removeMatch: function(req, res) {
    helper.verifyBody(req, res, ['deletedUserId']);
    request.removeMatch(req.params.id, req.body.deletedUserId, 
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
 
module.exports = requests;