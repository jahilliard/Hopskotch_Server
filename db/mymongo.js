var util = require("util");
var mongoClient = require('mongodb').MongoClient;

var mongoDB = {

  var myMongo;
  // default to a 'localhost' configuration:
  var connection_string = '127.0.0.1:27017/barrDev';

  mongoClient.connect('mongodb://'+connection_string, function(err, db) {
    if (err) doError(err);
    console.log("Connected correctly to server");
    myMongo = db;
  });

  var doError: function(e) {
        util.debug("ERROR: " + e);
        throw new Error(e);
    }
  }

  // INSERT 
  insert: function(collection, query, callback) {
        myMongo.collection(collection).insert(
          query,
          {safe: true},
          function(err, crsr) {
            if (err) doError(err);
            callback(crsr);
          });
  }

  // FIND
  find: function(collection, query, callback) {
        var crsr = myMongo.collection(collection).find(query);
        crsr.toArray(function(err, docs) {
          if (err) doError(err);
          callback(docs);
        });
  }

  // FIND ONE
  findOne: function(collection, query, callback) {
        myMongo.collection(collection).findOne(query,
          function(err, docs) {
          if (err) doError(err); 
          callback(docs);
        });
  }

  // UPDATE
  update: function(collection, query, callback) {
          myMongo.collection(collection).update(
            query.find,
            query.update,
            function(err, crsr) {
              if (err) doError(err);
              callback(crsr);
        });
  }

  // Remove
  remove: function(collection, query, callback) {
      myMongo.collection(collection).remove( 
          query,
          {safe: true},
          function(err, docs) {
            if (err) doError(err);
            callback(docs);
          });
  }

};

module.exports = mongoDB;