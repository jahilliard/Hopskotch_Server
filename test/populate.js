var mongoose = require('mongoose');
var User = require("../models/User.js");
var Location = require("../models/Location.js");
var Room = require("../models/Room.js");
var Match = require("../models/Match.js");

var populate = function () {
		var justin = new User({
			firstName: "Justin",
			lastName: "Hilliard",
  			nickname: "Dope",
  			role: "user",
			email: "justin.a.hilliard@gmail.com",
			password: "password",
			phoneNum: "4248324469"
		});
		var Abby = new User({
			firstName: "Abby",
			lastName: "Ugly",
  			nickname: "not chill",
  			role: "user",
			email: "Abby@gmail.com",
			password: "password",
			phoneNum: "3239733113"
		});
		var crabHut = new Location({
			name: "Crab Hut",
			mainImg: "http://www.crabhutrestaurant.com/images/mainpic/mainpic02.jpg",
			lat: 40.446288,
			lng: -79.947451,
			menu: [{
  				name: "dirty Crab",
  				price: 1000
			}]
		});
		justin.save(function (err) {
  			if (err) {
  				console.log("error  " + err);
				return err;
  			}
  			else {
  				console.log("Justin saved");
  			}
		});
		Abby.save(function (err) {
  			if (err) {
  				console.log("error  " + err);
				return err;
  			}
  			else {
  				console.log("Abby saved");
  				User.getByEmail("justin.a.hilliard@gmail.com", function(err, retJustin){
  					User.getByEmail("Abby@gmail.com", function(err, retAbby){
  						var jmatch = new Match({
  								userId: retJustin._id,
  								matchList: [{
									  	userId: retAbby._id,
									  	nickname: retAbby.nickname,
										firstName: retAbby.firstName,
										lastName: retAbby.lastName,
										job: "being stupid",
										isOpen: true,
										expire: Date.now(),
										img: "String"
								}]
						});
  						var amatch = new Match({
  								userId: retAbby._id,
  								matchList: [{
									  	userId: retJustin._id,
									  	nickname: retJustin.nickname,
										firstName: retJustin.firstName,
										lastName: retJustin.lastName,
										job: "being stupid",
										isOpen: true,
										expire: Date.now(),
										img: "String"
								}]
						});
  						jmatch.save(function (err) {
  										if (err) {
  											console.log("error  " + err);
											return err;
  										}
  										else {
  											console.log("Justin Match with Abbey saved");
  										}
  						});
  						amatch.save(function (err) {
  										if (err) {
  											console.log("error  " + err);
											return err;
  										}
  										else {
  											console.log("Abbey Match with Justin saved");
  										}
  						});
  					});
  				});
  			}
		});
		crabHut.save(function (err) {
  			if (err) {
  				console.log("error  " + err);
				return err;
  			}
  			else {
  				console.log("Crab Hut saved");
  				Location.getByName("Crab Hut", function(err, retCrabHut){
  					User.getByEmail("justin.a.hilliard@gmail.com", function(err, retJustin){
  							var crabRoom = new Room({
							  locationId: retCrabHut._id, 
							  members: [{
							  	userId: retJustin._id,
							  	nickname: retJustin.nickname,
								firstName: retJustin.firstName,
								lastName: retJustin.lastName
							  }]
							});
							crabRoom.save(function (err) {
  								if (err) {
  									console.log("error  " + err);
									return err;
  								}
  								else {
  									console.log("Room saved");
  								}
  							});
  					});
  				});
  			}
  		});
}

module.exports = populate;

