"use strict";
var MongoClient = require('mongodb').MongoClient;
var connection = require('./connection.json').production;
const mongoose = require("mongoose");
var assert = require('assert');
const getdbUrl = function (){
    var url = '';
    if (connection.user.length == 0 || connection.user == ' ') {
        url =  'mongodb://' + connection.url + ':' + connection.port + '/' + connection.db;
    } else {
        url = 'mongodb://' + connection.user + ':' + connection.password + '@' + connection.url + ':' + connection.port + '/' + connection.db;
    }
    //
    url="mongodb://LicenceDbAdmin:Admin91@cluster0-shard-00-00.60uuo.mongodb.net:27017,cluster0-shard-00-01.60uuo.mongodb.net:27017,cluster0-shard-00-02.60uuo.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-145abf-shard-0&authSource=admin&retryWrites=true&w=majority";
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
        module.exports.ClientInfo = db.collection('clientInfo');

        callback (err, getdbPort());
    });
   
};

module.exports = {
    runDB: runDB,
    getdbUrl
};