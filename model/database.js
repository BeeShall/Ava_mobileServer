var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://ava:ava123@ds050739.mlab.com:50739/ava';
var db;

MongoClient.connect(url, function (err, database) {
    if (!err) {
        console.log("Connected correctly to server.");
        db = database;
    } else {
        console.log("Cannot connect to db");
    }
});

exports.createUser = function (userName, password, role, callBack) {
    db.collection('users').insertOne({
        username: userName,
        password: password,
        role: role
    }, function (err, results) {
        if (!err) {
            console.log("Username created")
            callBack(true);
        } else console.log(err)
    })
}

exports.getUser = function (username, callBack) {
    cursor = db.collection("users").find({
        "username": username
    });
    cursor.nextObject(function (err, doc) {
        if (err) {
            callBack(true)
        } else {
            if (doc == null) {
                callBack(true);
            }
            else{
                callBack(false, {password: doc["password"] ,id: doc["_id"] })
            }
        }
    })
}

exports.getEmergencyContacts = function(id, callBack){
    console.log(id)
    cursor = db.collection("users").find({
        "_id": new mongodb.ObjectID(id)
    });
    cursor.nextObject(function(err,doc){
        if(err) {
            console.log(err)
            callBack(true)
        }
        else{
            if(doc==null) callBack(true)
            else{
                callBack(false, {user: doc['firstName'],contacts: doc["ice"]})
            }
        }
    })
}