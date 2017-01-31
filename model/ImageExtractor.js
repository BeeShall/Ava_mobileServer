var Vision = require('@google-cloud/vision');
var request = require('request');
var lDistance = require('./procedureLookup.js')
var fs = require('fs');

//var vision = Vision()

var apikeys = 'AIzaSyCBqDjWswy1NamjWhw1p23ECDDfLXSUz_c';
const vision = require('node-cloud-vision-api');
vision.init({
  auth: apikeys
});


function detectLabels(inputFile, callback) {


  req = new vision.Request({
    image: new vision.Image({
      base64: inputFile
    }),
    features: [
      new vision.Feature('TEXT_DETECTION', 10),
    ]
  })

  // send single request
  vision.annotate(req).then((res) => {
    // handling response
    callback(null, res.responses[0].textAnnotations)
  }, (e) => {

    callback(e);
  })

}

exports.getLabels = function (inputFile, callback) {
  detectLabels(inputFile, function (err, labels) {
    if (err) {
      return callback(err);
    }
    if (labels) {
      callback(null, labels[0].description);
    } else {
      callback("Invalid Image")
    }
  });
}

exports.checkLabel = function (labels, labelsListFile, callback) {
  fs.readFile(labelsListFile, 'utf8', function (err, data) {
    if (err) {
      console.log("checking labels")
      console.log(err);
      callback(true)
    }
    drugs = JSON.parse(data);
    var tokens = labels.split('\n')

    for (var i in tokens) {
      if (drugs[tokens[i].toUpperCase()]) return callback(false, tokens[i])
    }
    var best = {
      key: '',
      distance: 10000000000
    }
    for (var i in tokens) {
      for (drug in drugs) {
        var distance = lDistance.getLDistance(tokens[i].toUpperCase(), drug);
        if (distance < best.distance) {
          best.key = drug;
          best.distance = distance
        }
      }
    }

    if(best.key) return callback(false, best.key)

    return callback(true);
  });
}