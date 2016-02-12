var helper = {
	verifyBody: function(req, res, fields){
		fields.forEach(function(fieldName){
		  if (!(fieldName in req.body)) {
		    res.status(400);
		    res.json({"message": "request missing field: " + fieldName});
		  }
		});
	}
}

module.exports = helper;