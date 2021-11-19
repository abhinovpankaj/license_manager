"use strict";
var MongoClient = require('mongodb').MongoClient;
var connection = require('./connection.json').development;
const mongoose = require("mongoose");
var assert = require('assert');
const getdbUrl = function (){
    var url = '';
    if (connection.user.length == 0 || connection.user == ' ') {
        url =  'mongodb://' + connection.url + ':' + connection.port + '/' + connection.db;
    } else {
        url = 'mongodb://' + connection.user + ':' + connection.password + '@' + connection.url + ':' + connection.port + '/' + connection.db;
    }
    return url;
}
function getdbPort(){
    return connection.port;
}
var runDB = function (callback) {
    MongoClient.connect(getdbUrl(), function (err, db) {
        assert.equal(null, err);
        module.exports.Software = db.collection('software');
        module.exports.Licenses = db.collection('licenses');
        module.exports.Users = db.collection('users');
        callback (err, getdbPort());
    });
    // mongoose.connect(getdbUrl(), {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true
        
    //     })
    //     .then(() => {
    //     console.log("Successfully connected to database via mongoose");
    //     })
    //     .catch((error) => {
    //     console.log("database connection failed. exiting now...");
    //     console.error(error);
    //     process.exit(1);
    //     });
};

module.exports = {
    runDB: runDB,
    getdbUrl
};