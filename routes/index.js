var express = require('express');
var router = express.Router();
var procedures = require('../model/procedureLookup.js')
var authenticate = require('../model/authenticate.js')




/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});

router.post('/login', function (req, res, next) {
	console.log(req.body.username)
	console.log(req.body.password)
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


router.post('/signup', function (req, res, next) {
	console.log(req.body);
	var db = req.app.locals.db;
	var user = {
		fName: req.body.firstname,
		lName: req.body.lastname,
		username: req.body.username,
		password: req.body.password,
		eName: req.body.emergencyName,
		ePhone: req.body.emergencyPhone
	}
	authenticate.createUser(db, user, function (status) {
		if (!status) res.send({
			status: false
		})
		else res.send({
			status: true
		})
	})
})

router.post('/addMedication', function (req, res, next) {
	console.log(req.body)
	var weekdays = req.body.weekdays.slice(1, req.body.weekdays.length - 1).split(", ")
	console.log(weekdays)
	var times = req.body.times.slice(1, req.body.times.length - 1).split(", ")
	console.log(times)
	//split to make it an array
	var db = req.app.locals.db;
	db.getUserData(req.headers.mongoid, function (err, doc) {
		if (err) {
			res.send({
				status: false
			})
			return

		} else {
			//check if the medicine already exists
			for(var i in doc['prescriptions']){
				if(doc['prescriptions'][i].name == req.body.medicine){
					res.send({status:false})
					return;
				}
			}


			doc['prescriptions'].push({
				name: req.body.medicine,
				dosage: 0
			})
			for (var i in weekdays) {
				for (var j in times) {
					var schedTimes = doc['scheduled_medications'][weekdays[i].toString()];
					var done = false;
					for (var k in schedTimes) {
						if (schedTimes[k].time == times[j]) {
							//console.log(schedTimes[k])
							schedTimes[k].medication.push({
								name: req.body.medicine,
								times_missed: 0,
								"latest_time_missed": "1970-01-01T00:00:00Z"
							})
							done = true;
							break;
						}
					}
					//check if the time already exists
					//if yes update the array
					//if not create new one
					if (!done) {
						console.log(i);
						console.log(weekdays[i].toString())
						doc['scheduled_medications'][weekdays[i].toString()].push({
							time: times[j],
							medication: [{
								name: req.body.medicine,
								times_missed: 0,
								"latest_time_missed": "1970-01-01T00:00:00Z"
							}]
						})
					}
				}
			}

			//console.log(JSON.stringify(doc));

			delete doc['_id'];
			db.updateUserRecord(req.headers.mongoid, doc, function (err) {
				if (!err) {
					res.send({
						status: true
					})
				} else {
					res.send({
						status: false
					})
				}
			})




			//do the database update call on doc



		}


	})

})

router.post('/forget', function (req, res, next) {
	console.log(req.body)
	var db = req.app.locals.db;
	db.getUser(req.headers.mongoid, function (err, doc) {
		if (err) {
			res.send({
				status: false
			})
			return

		} else {
			var schedTimes = doc['scheduled_medications'][req.body.day];
			for (var i in schedTimes) {
				if (schedTimes[i].time === req.body.time) {
					for (var j in schedTimes[i].medication) {
						if (schedTimes[i].medication[j].name.toLowerCase() === req.body.medicine.toLowerCase()) {
							schedTimes[i].medication[j]['times_missed'] += 1;
							schedTimes[i].medication[j]['latest_time_missed'] = req.body.timestamp;
							//update the document
							console.log(doc)
							res.send({
								status: true
							})
							return
						}
					}
				}
			}

			res.send({
				status: false
			})





		}
	})
})

router.get('/getReminders', function (req, res, next) {
	console.log(req.body)
	/*
	{
		mongoid : " ",
		medication: " ",
		days: [],
		times:[]
	}
	*/



})


router.post('/nextReminder', function (req, res, next) {

	var db = req.app.locals.db;
	var currDate = new Date(req.body.timestamp);
	db.getMedicationForDay(req.headers.mongoid, function (err, reminders) {
		if (err) {
			console.log("Error");
			res.send({
				status: false
			})
		}
		console.log("Reminders")
		var day = currDate.getDay();
		var currTime = currDate.getHours() * 100 + currDate.getMinutes();
		var medications = reminders[day];
		medications.sort(function (a, b) {
			return a.time - b.time
		})
		console.log(medications)

		for (var i = 0; i < medications.length; i++) {
			if (medications[i].time > currTime) {
				console.log("today")
				console.log(medications[i])
				var returnMeds = [];
				var meds = medications[i].medication;
				for (var j in meds) {
					returnMeds.push(meds[j].name)
				}
				res.send({
					status:true,
					day: day,
					time: medications[i].time,
					medications: returnMeds
				})
				return
			}
		}

		var nextDay = day + 1;
		while (day != nextDay) {
			var medications = reminders[day];
			if (medications.length === 0) {
				(day++) % 7;
			} else {
				medications.sort(function (a, b) {
					return a.time - b.time
				})
				console.log(day)
				console.log(medications[0])
				var returnMeds = [];

				var meds = medications[0].medication;
				for (var j in meds) {
					console.log(meds[j])
					returnMeds.push(meds[j].name)
				}

				res.send({
					status:true,
					day: day,
					time: medications[0].time,
					medications: returnMeds
				})
				return
			}
		}

		res.send({
			status: false
		})

	})


})

router.get('/logout', function (req, res, next) {
	req.logout();
	res.send("Successfully logged out!")
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
					res.send({
						status: true,
						medicine: data
					});
				} else {
					console.log("Error!")
					res.send({
						'status': false
					})
				}
			})
		} else {
			console.log("Invalid Image")
			res.send({
				'status': false
			})
		}
	})
})

router.post('/textme', function (req, res, next) {
	var twilio = req.app.locals.twilio;
	procedures.getProcedure(req.body.Body, "./data/procedures.json", function (err, response) {
		if (!err) {
			twilio.sendAMessage(req.body.From, response, function (done) {
				if (done) {
					console.log("Success")

				} else {
					console.log("Failure")
				}
				return;

			})
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