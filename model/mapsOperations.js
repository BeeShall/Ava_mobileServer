var request = require('request');
var apikeys = 'AIzaSyBSqOcYsd8zDyPmJ7aj-iKfex8mGhTw9ag';



exports.findNerestHospital = function (location, callBack) {
    var pathUrl = "https://maps.googleapis.com/maps/api/place/radarsearch/json?location="+location['lat']+","+location['lng']+"&radius=5000&type=hospital&key="+apikeys;
    console.log(pathUrl)
    request(pathUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    })
}