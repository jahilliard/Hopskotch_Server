  // TODO: safe option is deprecated, use mongo write concerns instead
var util = require("util");
var mongoClient = require('mongodb').MongoClient;

var MongoDB = {

  myMongo: false,
  // default to a 'localhost' configuration:
  connection_string : '127.0.0.1:27017/barrDev',

  doError: function(e) {
        util.debug("ERROR: " + e);
        throw new Error(e);
  },

  // INSERT 
  insert: function(collection, query, callback) {
        this.myMongo.collection(collection).insert(
          query,
          {safe: true},
          function(err, crsr) {
            console.log("myMongo insert")
            if (err) doError(err);
            callback(crsr);
          });
  },

  // FIND
  find: function(collection, query, callback) {
        var crsr = this.myMongo.collection(collection).find(query);
        crsr.toArray(function(err, docs) {
          if (err) doError(err);
          callback(docs);
        });
  },

  // FIND ONE
  findOne: function(collection, query, callback) {
        this.myMongo.collection(collection).findOne(query,
          function(err, docs) {
          if (err) doError(err); 
          callback(docs);
        });
  },

  // UPDATE
  update: function(collection, query, callback) {
        this.myMongo.collection(collection).update(
            query.find,
            query.update,
            function(err, crsr) {
              if (err) doError(err);
              callback(crsr);
        });
  },

  // Remove
  remove: function(collection, query, callback) {
      this.myMongo.collection(collection).remove( 
          query,
          {safe: true},
          function(err, docs) {
            if (err) doError(err);
            callback(docs);
      });
  }

};

mongoClient.connect('mongodb://'+MongoDB.connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected correctly to server");
  MongoDB.myMongo = db;
})

module.exports = MongoDB;