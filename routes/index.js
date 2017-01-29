var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});

router.post('/login', function (req, res, next) {
	console.log(req.body.username)
	console.log(req.body.password)
	console.log(req.app.locals.db)
	var passport = req.app.locals.passport;
	var auth = passport.authenticate('local', function (err, user, info) {
		if (err) {
			console.log(err)
			res.send({
				'status': false
			})
			return
		}
		if (!user) {
			console.log(info)
			res.send({
				'status': false
			})
			return
		}
		req.logIn(user, function (err) {
			if (err) {
				console.log(err);
				res.send({
					'status': false
				})
				return
			}
			console.log(user);
			res.send({
				'status': true,
				'id': user
			})

		})
	})
	auth(req, res);
})


router.get('/getReminders', function (req, res, next) {


})

router.get('/nextReminder', function (req, res, next) {

})

router.get('/logout', function (req, res, next) {
	req.logout();
	res.send("Successfully logged out!")
})




router.get('/sendMessage', function (req, res, next) {
	var twilio = req.app.locals.twilio;
	twilio.sendAMessage("+12012732259", "Hi Bishal", function (done) {
		if (done) {
			res.send("Success");
		} else {
			res.send("Failure")
		}

	})
})

router.post('/medicine', function (req, res, next) {
	var img = req.body.image;
	var googleVision = req.app.locals.googleVision;

	googleVision.getLabels(img, function (err, labels) {
		if (!err) {
			console.log(labels);
			googleVision.checkLabel(labels, "./data/drug_names.json", function (err, data) {
				if (!err) {
					console.log(data);
					res.send(data);
				} else {
					console.log("Error!")
					res.send("Error")
				}
			})
		} else {
			console.log(err)
		}
	})
})



router.post('/panic', function (req, res, next) {
	var loc = {
		'lat': req.body.lat,
		'lng': req.body.lng
	};
	var geoStuff = req.app.locals.geoStuffs;

	geoStuff.reverseGeoCode(loc, function (err, address) {
		if (!err) {
			console.log(address);
			var twilio = req.app.locals.twilio;
			var db = req.app.locals.db;
			console.log(req.headers.mongoid)
			db.getEmergencyContacts(req.headers.mongoid, function (err, data) {
				if (err) {
					console.log("error")
					res.end();
				} else {
					for (var i = 0; i < data.contacts.length; i++) {
						var message = "Hey " + data.contacts[i].name + "! This is " + data.user + ". I am having a medical emergency. I am currently at " +
							address + "\n\nThe authorities have been contacted, but please check in.\n\nSent: " + new Date().toString() +
							"\n\nIf you are first to respond, text this number your best diagnosis for instructions (Ex. 'heart attack')";

						twilio.sendAMessage(data.contacts[i].number, message, function (done) {
							if (!done) {
								res.send("Failure")
								return;
							}

						})


					}


					geoStuff.findNearestHospital(loc, function (err, data) {
						if (!err) {
							res.send(data);
						} else {
							console.log(err);
							res.send(err);
						}

					})
				}
			})




		}

	})


})

module.exports = router;