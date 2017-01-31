var fs = require('fs');

exports.getLDistance = checkDistance;

function checkDistance(a,b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}


exports.getProcedure = function (message, fileName, callback) {
    fs.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
            console.log("checking labels")
            console.log(err);
            callback(true)
        }
        procedures = JSON.parse(data);
        var returnData = procedures[message.toLowerCase()]
        if (returnData) {
            callback(false, returnData)
        } else {
            var best = {key:'',distance :10000000000}
            for (var key in procedures){
                var distance= checkDistance(key,message);
                if(distance<best.distance){
                    best.key = key;
                    best.distance = distance
                }
            }

            if(best.key) callback(false,procedures[best.key])
            else {
                console.log("No procedures for the key")
                callback(false)
            }


        }

    });
}