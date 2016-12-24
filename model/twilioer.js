var account_sid = "AC6cde470a46432c2d0860e433c15c3e7c"
var auth_token = "9e5655649b6730541da36baf87fd6051"

var client = require('twilio')(account_sid, auth_token);

var myNumber = "+12015741880"

exports.sendAMessage = function(number, message, callBack){
    client.sendMessage({

    to: number, 
    from: myNumber, 
    body: message 

}, function(err, responseData) { 

    if (!err) { 

        callBack(true);

    }
    else{
        callBack(false);
    }
});

}