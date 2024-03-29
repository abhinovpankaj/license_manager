"use strict";
var ObjectId = require('mongodb').ObjectID;
var mongo = require('./mongo');

//---------- SOFTWARE ------------//
var addSoftware = function (software, callback) {
    mongo.Software.insert({name: software.name}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addSoftware()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};


const updateSoftware = function (software, callback) {
    console.log('software===>',software);
    if (ObjectId.isValid(software.id) === false) {
        var error = new Error("getSoftware(). \nMessage: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }    
    mongo.Software.findOne({ _id: new ObjectId(software.id) }, function (err, item) {
        if (err) {
            callback (err);
            return;
        }
        if (item === null) {
            var error = new Error("updateSoftware(). \nMessage: No Software Found. One Requested.");
            error.status = 404;
            callback (error);
            return; 
        }
        item.name = software.name;
        mongo.Software.update({_id: new ObjectId(software.id) }, item);
        callback(null);
    });
}

var getSoftware = function (softwareId, callback) {
    if (ObjectId.isValid(softwareId) === false) {
        var error = new Error("getSoftware(). \nMessage: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }
    mongo.Software.findOne({ _id: new ObjectId(softwareId) }, function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("getSoftware(). \nMessage: No Software Found. One Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var getAllSoftware = function  (callback) {
    mongo.Software.find({}).toArray(function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("getAllSoftware(). \nMessage: No Software Found. All Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var removeSoftware = function (id, callback) {
    if (ObjectId.isValid(id) === false) {
        var error1 = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error1.status = 500;
        callback (error1);
        return;
    }
    mongo.Software.deleteOne({_id: new ObjectId(id)}, function (err, res) {
        if (err) {
            var error2 = new Error("Error occurred. Didn't remove software. " + err.message);
            error2.status = err.status;
            callback (error2);
            return;
        }
        if (res.deletedCount !== 1) {
            var error3 = new Error("Didn't remove software. " + err.message);
            error3.status = err.status;
            callback (error3);
            return;
        }
        mongo.Licenses.remove({softwareId: id},  function (err, result) {
            callback(null, result);
            return;
        });
    });
};

module.exports = {
    addSoftware: addSoftware,
    getSoftware: getSoftware,
    getAllSoftware: getAllSoftware,
    removeSoftware: removeSoftware,
    updateSoftware
};