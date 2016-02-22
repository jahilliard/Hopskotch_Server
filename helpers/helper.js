var helper = {
	verifyBody: function(req, res, fields){
		var bodyKeys = Object.keys(req.body);
		for(var i = 0; i < fields.length; i++){
		  if (bodyKeys.indexOf(fields[i]) <= -1) {
		    res.status(400);
		    res.json({"message": "request missing field: " + fields[i]});
		    return true;
		  }
		};
		return false;
	},

	verifyRequest: function(req, res, fields){
		var queryKeys = Object.keys(req.query);
		for(var i = 0; i < fields.length; i++){
		  if (queryKeys.indexOf(fields[i]) <= -1) {
		    res.status(400);
		    res.json({"message": "request missing field: " + fields[i]});
		    return true;
		  }
		};
		return false;
	}
}

module.exports = helper;