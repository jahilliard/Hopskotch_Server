var myMongo = require("../db/mymongo.js");

var GridStream = require('gridfs-stream');
GridStream.mongo = myMongo.mongoose.mongo;

var Room = require("../models/Room.js");
var User = require("../models/User.js");
var helper = require("../helpers/helper.js");
var FeedEntry = require("../models/FeedEntry.js");
var FeedEnum = require("../schemas/FeedEntrySchema.js").FeedEnum;
var _ = require('lodash');

//used to specify what fields of the model a client cannot update
function validateFields(fields, req, res){
  return 0;
}

var FeedEntryController = {
  createFeedEntry: function(req, res){
  	 if (helper.verifyBody(req, res, ['text'])) {
      return;
    }

	  	User.getById(req.body.id, function(err, user){
	  			if (err) {
	  					res.status(400);
	  					res.json({"errcode": err.code, "message": err.errmsg});
	  					return;
	  			}
	 				
	 				var roomId = user.currentCircle;
	 				if (roomId == "") {
	 						res.status(400);
	  					res.json({"errcode": 400, "message": "cannot post to feed, not currently in a circle"});
	  					return;
	 				}

			  	var newFeedEntry = new FeedEntry({roomId: roomId, userId: user._id, text: req.body.text, date: new Date()});

						if (!req.files || !req.files.newFile) {
								newFeedEntry.entryType = FeedEnum.PlainText;
								 newFeedEntry.saveFeedEntry(function(err, newEntry) {
						      res.status(200);
										  res.json({
										  	 "feedEntryId": newEntry._id,
										    "message": "success"
										  });
					  		 });
						} else {
							 //TODO: differentiate between image and video
							 newFeedEntry.entryType = FeedEnum.Image;
							 var newFileName = req.files.newFile.name;
			  			var newFile = req.files.newFile;
					  	var gfs = GridStream(myMongo.connection.db);
					  	var writestream = gfs.createWriteStream({
					  		 _id: newFeedEntry._id,
					    	filename: newFileName
					   });

					  	//TODO: what about error case?
					  	writestream.on('close', function (file) {
					  		 //TODO: no rollback/transactions for if this fails. The media will still save.
					  		 newFeedEntry.saveFeedEntry(function(err, newEntry) {
						      res.status(200);
										  res.json({
										  	 "feedEntryId": newEntry._id,
										    "message": "success"
										  });
					  		 });
					   });

					  	writestream.write(newFile.data);
					  	writestream.end();
						}
				});
  },

  downloadDataEntry: function(req, res) {
  	 console.log("HERE");
  	 var gfs = GridStream(myMongo.connection.db);
  	 var feedEntryId = req.params.feedEntryId;
  	 var readstream = gfs.createReadStream({
      _id: feedEntryId
				});

				readstream.pipe(res);
  },

  getNumUpdates: function(req, res) {
  	 var circleId = req.params.circleId;
  	 var numberOfEntries = req.query.numEntriesToFetch;
  	 var latestDate = new Date(-8640000000000000);
  	 if (req.query.latestDate) {
  	 	 latestDate = req.query.latestDate;
  	 }

  	 FeedEntry.findNewest(circleId, latestDate, 1, function(err, entries, count) {
  	 		if (err) {
  	 		  res.status(400);
	  					res.json({"errcode": err.code, "message": err.errmsg});
	  					return;
  	 		} 

  	 		var latestDate = null;
		  	 if (req.query.latestDate) {
		  	 	 latestDate = req.query.latestDate;
		  	 }
  	 		res.status(200);
					 res.json({"message": "success", "numNewEntries": count, "latestDate": latestDate});
  	 });
  },

  getFeedEntryUpdates: function(req, res) {
  	 if (helper.verifyRequest(req, res, ["numEntriesToFetch"])) {
  	 	 return;
  	 }

  	 var circleId = req.params.circleId;
  	 var numberOfEntries = req.query.numEntriesToFetch;

  	 var earliestDate = new Date(-8640000000000000);
  	 if (req.query.earliestDate) {
  	 	 earliestDate = req.query.earliestDate;
  	 }

  		FeedEntry.getFeedEntryUpdates(circleId, earliestDate, numberOfEntries, function(err, entries, totalAvailable) {
  				if (err) {
  					 res.status(400);
	  					res.json({"errcode": err.code, "message": err.errmsg});
	  					return;
  				}

  				var numUnretrieved = totalAvailable - entries.length;

  				var memberIds = _.uniq(_.map(entries, function(entry){return entry.userId;}));
  					 User.getUsersByIds(memberIds, function(err, users){
  					   if (err) {
	  					   	res.status(400);
					  					res.json({"errcode": err.code, "message": err.errmsg});
					  					return;
  					   } else {
  					     res.status(200);
					  					res.json({"message": "success", "entries": entries, "entryAuthors": users, "numEntries": entries.length, "numUnretrieved": numUnretrieved});
					  					return;
  					   }
  					 });
  		});
  },

  findEntriesInRange: function(req, res) {
  	 if (helper.verifyRequest(req, res, ["earliestDate", "latestDate", "numEntriesToFetch"])) {
  	 	 return;
  	 }

  	 var circleId = req.params.circleId;
  	 var numberOfEntries = req.query.numEntriesToFetch;
  	 var earliestDate = req.query.earliestDate;
  	 var latestDate = req.query.latestDate;
  		FeedEntry.findInRange(earliestDate, latestDate, circleId, numberOfEntries, function(err, entries, totalEntriesCount) {
  				if (err) {
  					 res.status(400);
	  					res.json({"errcode": err.code, "message": err.errmsg});
	  					return;
  				}

  				var numRemainingEntries = totalEntriesCount - entries.length;
  				var memberIds = _.uniq(_.map(entries, function(entry){return entry.userId;}));
  					 User.getUsersByIds(memberIds, function(err, users){
  					   if (err) {
	  					   	res.status(400);
					  					res.json({"errcode": err.code, "message": err.errmsg});
					  					return;
  					   } else {
  					     res.status(200);
					  					res.json({"message": "success", "entries": entries, "entryAuthors": users, "numRemainingEntries": numRemainingEntries});
					  					console.log(entries);
					  					console.log(users);
					  					return;
  					   }
  					 });
  		})
  },

  getNewestEntries: function(req, res) {
  	 if (helper.verifyRequest(req, res, ["numEntriesToFetch"])) {
  	 	 return;
  	 }

  	 var circleId = req.params.circleId;
  	 var numberOfEntries = req.query.numEntriesToFetch;
  	 var latestDate = new Date(-8640000000000000);
  	 if (req.query.earliestDate) {
  	 	 latestDate = req.query.earliestDate;
  	 }

  		FeedEntry.findNewest(circleId, latestDate, numberOfEntries, function(err, entries, totalEntriesCount) {
  				if (err) {
  					 res.status(400);
	  					res.json({"errcode": err.code, "message": err.errmsg});
	  					return;
  				} else {
  					 var numRemainingEntries =  totalEntriesCount - entries.length;
  					 var memberIds = _.uniq(_.map(entries, function(entry){return entry.userId;}));
  					 User.getUsersByIds(memberIds, function(err, users){
  					   if (err) {
	  					   	res.status(400);
					  					res.json({"errcode": err.code, "message": err.errmsg});
					  					return;
  					   } else {
  					     res.status(200);
					  					res.json({"message": "success", "entries": entries, "entryAuthors": users, "numRemainingEntries": numRemainingEntries});
					  					console.log(entries);
					  					console.log(users);
					  					return;
  					   }
  					 });
  				}
  		});
  },
  
  getOlderEntries: function(req, res) {
  	 if (helper.verifyRequest(req, res, ["numEntriesToFetch", "latestDate"])) {
  	 	 return;
  	 }

  	 var circleId = req.params.circleId;
  	 var numberOfEntries = req.query.numEntriesToFetch;
  	 var time = req.query.latestDate;
  	 console.log("HERE");
  	 console.log(time);
  		FeedEntry.findOlderByTime(time, circleId, numberOfEntries, function(err, entries, count) {
  				if (err) {
  					 res.status(400);
	  					res.json({"errcode": err.code, "message": err.errmsg});
	  					console.log(err);
	  					return;
  				} else {
  					 var numRemainingEntries =  count - entries.length;
  						var memberIds = _.uniq(_.map(entries, function(entry){return entry.userId;}));
  					 User.getUsersByIds(memberIds, function(err, users){
  					   if (err) {
	  					   	res.status(400);
					  					res.json({"errcode": err.code, "message": err.errmsg});
					  					console.log(err);
					  					return;
  					   } else {
  					     res.status(200);
					  					res.json({"message": "success", "entries": entries, "entryAuthors": users, "numUnretrieved": numRemainingEntries});
					  					return;
  					   }
  					 });
  				}
  		});
  }
};

module.exports = FeedEntryController;