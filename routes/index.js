var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});


router.post('/textme', function (req, res, next) {
  console.log(req.body.Body);
});

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

router.get('/findMedicine', function (req, res, next) {
  var googleVision = req.app.locals.googleVision;

  googleVision.getLabels("./advil.png", function (err, labels) {
    if (!err) {
      console.log(labels);
      googleVision.checkLabel(labels, "./data/drug_names.json", function (err, data) {
        if (!err) {
          console.log(data);
          res.end();
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

module.exports = router;