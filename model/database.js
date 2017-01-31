var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://ava:ava123@ds050739.mlab.com:50739/ava';
var db;

var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

MongoClient.connect(url, function (err, database) {
    if (!err) {
        console.log("Connected correctly to server.");
        db = database;
    } else {
        console.log("Cannot connect to db");
    }
});

exports.createUser = function (user, password, callBack) {
    db.collection('users').insertOne({
        "username": user.username,
        "medication": [],
        "firstName": user.fName,
        "prescriptions": [],
        "lastName": user.lName,
        "contacts": [{
            name:user.eName,
            number:user.ePhone
        }],
        "scheduled_medications": {
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "password": password
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
            } else {
                callBack(false, {
                    password: doc["password"],
                    id: doc["_id"]
                })
            }
        }
    })
}

exports.getUserData = function(id, callBack){
    cursor = db.collection("users").find({
        "_id": new mongodb.ObjectID(id)
    });
    cursor.nextObject(function(err,doc){
        if(err){
            console.log(err)
            callBack(true)
        }
        else{
            callBack(false, doc)
        }
    })
}

exports.getEmergencyContacts = function (id, callBack) {
    console.log(id)
    cursor = db.collection("users").find({
        "_id": new mongodb.ObjectID(id)
    });
    cursor.nextObject(function (err, doc) {
        if (err) {
            console.log(err)
            callBack(true)
        } else {
            if (doc == null) callBack(true)
            else {
                callBack(false, {
                    user: doc['firstName'],
                    contacts: doc["contacts"]
                })
            }
        }
    })
}

exports.getMedicationForDay = function (id, callBack) {
    cursor = db.collection("users").find({
        "_id": new mongodb.ObjectID(id)
    });
    cursor.nextObject(function (err, doc) {
        if (err) {
            console.log(err);
            callBack(true)
        } else {
            if (doc == null) callBack(true);
            else {
                callBack(false, doc['scheduled_medications'])
            }
        }
    })
}