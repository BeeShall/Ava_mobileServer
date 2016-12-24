var Vision = require('@google-cloud/vision');

var vision = Vision()


function detectLabels (inputFile, callback) {
  vision.detectText(inputFile, { verbose: true }, function (err, labels) {
    if (err) {
      return callback(err);
    }
    callback(null, labels);
  });
}

// Run the example
exports.getLabels = function (inputFile, callback) {
  detectLabels(inputFile, function (err, labels) {
    if (err) {
      return callback(err);
    }

    console.log('Found label: ' + labels[0].desc);
    callback(null, labels[0].desc);
  });
}