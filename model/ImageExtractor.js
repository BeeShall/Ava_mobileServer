var Vision = require('@google-cloud/vision');
var request = require('request');
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
    callback(null,res.responses[0].textAnnotations)
  }, (e) => {
    callback(e);
  })

}

exports.getLabels = function (inputFile, callback) {
  detectLabels(inputFile, function (err, labels) {
    if (err) {
      return callback(err);
    }
    callback(null, labels[0].description);
  });
}

exports.checkLabel = function (labels, labelsListFile, callback) {
  fs.readFile(labelsListFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    drugs = JSON.parse(data);
    var tokens = labels.split('\n')

    for (var i in tokens) {
      if (drugs[tokens[i].toUpperCase()]) return callback(false, tokens[i])
    }
    return callback(true);
  });
}