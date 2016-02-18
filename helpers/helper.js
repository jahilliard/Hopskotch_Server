var helper = {
	verifyBody: function(req, res, fields){
		var bodyKeys = Object.keys(req.body);
		for(var i = 0; i < fields.length; i++){
		  if (!(fields[i] in bodyKeys)) {
		    res.status(400);
		    res.json({"message": "request missing field: " + fields[i]});
		    return true;
		  }
		};
		return false;
	}
}

module.exports = helper;