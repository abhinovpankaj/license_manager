"use strict";
var guid = require('guid');
var ObjectId = require('mongodb').ObjectID;
var mongo = require('./mongo');

//------------- LICENSES -----------------//
var addLicense = function (license, callback) {
    mongo.Licenses.insert({
        userOrganizationName: license.userOrganizationName,
        expirationDate: license.expirationDate,
        allowedActivations: license.allowedActivations,
        configurationsNameID: license.configurationsNameID,
        softwareId: license.softwareId,
        licenseUniqueID: guid.create(),
        issuedLicenses: []
    }, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("Added License. " + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};
var getLicense = function (licenseId, callback) {
    if (ObjectId.isValid(licenseId) === false) {
        var error = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }
    mongo.Licenses.findOne({ _id: new ObjectId(licenseId) }, function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("No License Found. One Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var deleteLicense = function (licenseId, callback) {
    if (ObjectId.isValid(licenseId) === false) {
        var error = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }
    mongo.Licenses.deleteOne({_id: new ObjectId(licenseId)}, function (err, res) {
        if (err) {
            var error2 = new Error("Error occurred. Didn't remove software. " + err.message);
            error2.status = err.status;
            callback (error2);
            return;
        }
        callback(null);
    })
}
var updateLicense = function (licenseId, softwareId, license, callback) {
    if (ObjectId.isValid(licenseId) === false) {
        var error = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 500;
        callback (error);
        return;
    }
    mongo.Licenses.updateOne({
            _id: new ObjectId(licenseId),
            softwareId: softwareId
        },
        {$set: {
            expirationDate: license.expirationDate,
            allowedActivations: license.allowedActivations,
            userOrganizationName: license.userOrganizationName,
            softwareId: license.softwareId
        }}, {w: 1}, function(err, result) {
            if (err) {
                var error3 = new Error("Cannot update license. Try again.");
                error3.status = 403;
                callback (error3);
                return;
            }
            if (result.matchedCount !== 1) {
                var error1 = new Error("No license was found.");
                error1.status = 404;
                callback (error1);
                return;
            } else if (result.modifiedCount !== 1) {
                var error2 = new Error("No license was updated.");
                error2.status = 404;
                callback (error2);
                return;
            }
            if (err) { callback (err); return; }
            callback(null, result);
        });
};
var getAllLicenses = function (softwareId, callback) {
    mongo.Licenses.find({softwareId: softwareId}).toArray(function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("Message: No Licenses Found. All Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};

var checkLicense = function (body, callback) {
    const {email,client_os_version,outlook_version } = body;

    mongo.Licenses.find().toArray(async function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("Message: No Licenses Found. All Requested.");
            error.status = 404;
            callback (error);
            return; }

        const currentLicense = [];
        for( let item of result){
            const {issuedLicenses, expirationDate} = item;
            const issuedLicensesByEmail = issuedLicenses.filter(a=>a.email === email);
            console.log('issuedLicensesByEmail',issuedLicenses,email);
            if(issuedLicensesByEmail.length > 0 ){
                currentLicense.push(item)
                break;
            }
        }
     
        if(currentLicense.length === 0 ){
            var error = new Error("No valid user found");
            error.status = 404;
            callback(error);
        
        }else{

                
            const {_id,issuedLicenses, licenseUniqueID ,expirationDate} = currentLicense[0];
            const todaysDate = new Date().getTime();
            const licExpirationDate = new Date(expirationDate).getTime();

            const removedocs = await mongo.ClientInfo.remove({email:email});
            mongo.ClientInfo.insert({
                email,
                lic_obj_id: _id,
                licenseId: licenseUniqueID.value,
                expirationDate: expirationDate,
                client_os_version:client_os_version,
                outlook_version:outlook_version,
                request_time: new Date()

            }, {w: 1}, function (err, result) {
                if (err) {
                    var error = new Error("Added Client Info. " + err.message);
                    error.status = err.status;
                    // callback (error);
                    // return;
                }
                // callback(null, result);
            });

            if (todaysDate > licExpirationDate ){
                var error = new Error("License is expired");
                error.status = 404;
                callback(null,{ message: 'License is expired, please contact your administrator', isValid: false });
            }else{

           
    
                callback(null,{ message: 'License is valid', isValid: true });
                // callback(null,{ message: 'License is valid' });
            }
            
         
        }

        // callback(null, result);
    });
};

var getClientInfo = function (body, callback) {
    const { } = body;

    mongo.ClientInfo.find().toArray(async function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("Message: No Client Info Found. All Requested.");
            error.status = 404;
            callback (error);
            return; 
        }else{

            const resultArr = [];
            for(let item of result){
                const licenseInfo = await mongo.Licenses.findOne({ _id: new ObjectId(item.lic_obj_id) });
                if(licenseInfo){
                    const softwareInfo = await mongo.Software.findOne({ _id: new ObjectId(licenseInfo.softwareId) });
                    resultArr.push({
                        ...item,
                        licenseInfo,
                        softwareInfo
                    })
                }

            }
            // 
            callback(null, resultArr); 
        }

        // callback(null, result);
    });
};

module.exports = {
    addLicense: addLicense,
    getLicense: getLicense,
    updateLicense: updateLicense,
    getAllLicenses: getAllLicenses,
    deleteLicense,
    checkLicense,
    getClientInfo
};