"use strict";
var ObjectId = require('mongodb').ObjectID;
var mongo = require('./mongo');
const Role = require('./role');

var addUser = function (user, callback) {
    mongo.Users.insert({last_name: user.last_name,first_name:user.first_name,email:user.email,
    password:user.password,role:Role.User}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addUser()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};
var addAdmin = function (user, callback) {
    mongo.Users.insert({last_name: user.last_name,first_name:user.first_name,email:user.email,
    password:user.password,role:Role.Admin}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addAdmin()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};
var getUser = function (emailId, callback) {
    
    mongo.Users.findOne({ email: emailId }, function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error1 = new Error("getUser(). \nMessage: No User Found. One Requested.");
            error1.status = 404;
            callback (error1);
            return; 
        }
        callback(null, result);
    });
};

var getAllUser = function  (callback) {
    mongo.Users.find({}).toArray(function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("getAllUser(). \nMessage: No User Found. All Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var removeUser = function (id, callback) {
    if (ObjectId.isValid(id) === false) {
        var error1 = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error1.status = 500;
        callback (error1);
        return;
    }
    mongo.Users.deleteOne({_id: new ObjectId(id)}, function (err, res) {
        if (err) {
            var error2 = new Error("Error occurred. Didn't remove user. " + err.message);
            error2.status = err.status;
            callback (error2);
            return;
        }
        if (res.deletedCount !== 1) {
            var error3 = new Error("Didn't remove user. " + err.message);
            error3.status = err.status;
            callback (error3);
            return;
        }
        
        callback(null, result);
        });
    };


module.exports = {
    addUser: addUser,
    getUser: getUser,
    addAdmin:addAdmin,
    getAllUser: getAllUser,
    removeUser: removeUser
};