  // TODO: safe option is deprecated, use mongo write concerns instead
var util = require("util");
var mongoose = require('mongoose');

/*var MongoDB = {

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
            if (err) {
              callback(err, null);
            } else {
              callback(null, crsr);
            }
          });
  },

  // FIND
  find: function(collection, query, callback) {
        var crsr = this.myMongo.collection(collection).find(query);
        crsr.toArray(function(err, docs) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, docs);
          }
        });
  },

  // FIND ONE
  findOne: function(collection, query, callback) {
        this.myMongo.collection(collection).findOne(query,
          function(err, docs) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, docs);
            }
        });
  },

  // UPDATE
  update: function(collection, query, callback) {
        this.myMongo.collection(collection).update(
            query.find,
            query.update,
            function(err, crsr) {
              if (err) {
                callback(err, null);
              } else {
                callback(null, crsr);
              }
        });
  },

  // Remove
  remove: function(collection, query, callback) {
      this.myMongo.collection(collection).remove( 
          query,
          {safe: true},
          function(err, docs) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, docs);
            }
      });
  },

  createIndex: function(collection, query, options, callback) {
    var requestCollection = this.myMongo.collection("request");
    requestCollection.ensureIndex(query, options, function(err, indexName){
      if (err) {
        callback(err);
      } else {
        callback(null)
      }
    });
  }
};*/

var MongoDB = {
  connection : null,
  mongoose: null,

  initializeMongoose: function(callback){
    this.mongoose = mongoose;
    var db = mongoose.connection;
    this.connection = db;

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', callback);

    var connection_string = '127.0.0.1:27017/barrDev';
    mongoose.connect('mongodb://' + connection_string);
  }
}


  //initiailize indexes for those collections that need it
  /*MongoDB.createIndex("request", "matchList.requesterId", {unique: true}, 
    function(err){
      if (err){
        console.log("COULD NOT CREATE INDEX");
        throw(err);
      }
    })*/

module.exports = MongoDB;