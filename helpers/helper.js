var _ = require('lodash');

var helper = {
	verifyBody: function(req, res, fields){
		for(var i = 0; i < fields.length; i++){
		  if (_.get(req.body, fields[i], null) == null) {
		    res.status(400);
		    res.json({"message": "body missing field: " + fields[i]});
		    return true;
		  }
		};
		return false;
	},

	verifyRequest: function(req, res, fields){
		for(var i = 0; i < fields.length; i++){
		  if (_.get(req.query, fields[i], null) == null) {
		    res.status(400);
		    res.json({"message": "request missing field: " + fields[i]});
		    return true;
		  }
		};
		return false;
	}
}

module.exports = helper;