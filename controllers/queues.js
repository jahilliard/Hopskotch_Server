var queue = require("../models/queue.js");
var helper = require("../helpers/helper.js");

var queues = {
 
  getAll: function(req, res) {
    queue.allQueues(function(err, queues){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "queues": queues});
      }
    });
  },
 
  getOne: function(req, res) {
    queue.findQueue(req.params.id, function(err, queue){
      if(err){
        res.status(404);
        res.json({"errcode": err.code, "message": err.errmsg});
      } else {
        res.status(200);
        res.json({"message": "success", "queue": queue});
      }
    });
  },
 
  create: function(req, res) {
    helper.verifyBody(req, res, ['rid']);
    var queueList = [];

    if ('queue' in req.body){
      queueList = req.body.queue;
    }

    queue.createQueue(req.body.rid, queueList, 
      function(err, newQueue){
        if (err){
          res.status(404);
          res.json({
            "errcode": err.code,
            "message": err.errmsg
          });
        } else {
          res.status(201);
          res.json({
            "id": req.body.rid,
            "message": "success"
          });
        }
      });
  },
 
  update: function(req, res) {
    helper.verifyBody(req, res, ['fields']);
    queue.update(req.params.id, req.body.fields, function(err, status){
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
    queue.delete(req.params.id, function(err, deletedQueue){
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

  addUserToQueue: function(req, res) {
    helper.verifyBody(req, res, ['user']);
    queue.addUserToQueue(req.params.id, req.body.user, 
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

  removeUserFromQueue: function(req, res) {
    helper.verifyBody(req, res, ['userId']);
    queue.removeUserFromQueue(req.params.id, req.body.userId, 
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
 
module.exports = queues;