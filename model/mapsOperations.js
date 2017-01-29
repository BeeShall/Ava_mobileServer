var request = require('request');
var apikeys = 'AIzaSyBSqOcYsd8zDyPmJ7aj-iKfex8mGhTw9ag';


exports.reverseGeoCode = function(loc, callBack) {
    
    var serviceUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + loc.lat + "," + loc.lng + "&key=" + apikeys;
    console.log(serviceUrl);
    request(serviceUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callBack(null, JSON.parse(body).results[0].formatted_address)
        } else {
            console.log(error)
            callBack(error);
        }
    })
}


function findHospitalDetails(placeid, callBack) {
    var serviceUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeid + "&key=" + apikeys;
    console.log(serviceUrl)
    request(serviceUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body).result;
            var returnData = {
                "name": data.name,
                "location": data.formatted_address,
                "phone": data.international_phone_number,
                "website": data.website
            }
            console.log(returnData)
            callBack(null, returnData)
        } else {
            callBack(error);
        }
    })
}




exports.findNearestHospital = function (location, callBack) {
    var pathUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json?location=" + location['lat'] + "," + location['lng'] + "&radius=5000&type=hospital&key=" + apikeys;
    console.log(pathUrl);
    request(pathUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            findHospitalDetails(JSON.parse(body).results[0].place_id, function (error, data) {
                console.log(data)
                callBack(null, data);
            })
        } else {
            callBack(error);
        }
    })
}