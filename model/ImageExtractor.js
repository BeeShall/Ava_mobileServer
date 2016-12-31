var Vision = require('@google-cloud/vision');
var fs = require('fs');

var vision = Vision()


function detectLabels(inputFile, callback) {
  vision.detectText(inputFile, {
    verbose: true
  }, function (err, labels) {
    if (err) {
      return callback(err);
    }
    callback(null, labels);
  });
}

exports.getLabels = function (inputFile, callback) {
  detectLabels(inputFile, function (err, labels) {
    if (err) {
      return callback(err);
    }

    callback(null, labels[0].desc);
  });
}

exports.checkLabel = function (labels, labelsListFile, callback) {
  fs.readFile(labelsListFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    drugs = JSON.parse(data);
    var tokens = labels.split('\n')

    for( var i in tokens){
      if(drugs[tokens[i].toUpperCase()])  return callback(false, tokens[i])
    }
  return callback(true);
  });
}