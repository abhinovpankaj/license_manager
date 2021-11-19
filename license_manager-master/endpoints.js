"use strict";
var express = require('express');
var router = express.Router();
var software = require('./data/software');
var licenses = require('./data/licenses');
var activations = require('./data/activations');
var path = require('path');
const users = require("./data/userdb");
const bcrypt=require('bcrypt');
var jwt = require('jsonwebtoken');
const auth=require('./authorize')
const Role=require('./data/role');
const { nextTick } = require('process');
const { RSA_NO_PADDING } = require('constants');


require("dotenv").config();

//---------- SOFTWARE ------------//
function getAll(req, res) {
    software.getAllSoftware(function (err, records) {
        if (err) { res.status(err.status).send(err.message); }
        else { res.json(records); }
    });
}
router.route('/software')
    .get(getAll)
    .post(function (req, res) {
        software.addSoftware(req.body, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    });

router.route('/software/:softwareId')
    .get(function (req, res) {
        software.getSoftware(req.params.softwareId, function (err, record) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(record); }
        });
    })
    .put(function(req, res) {
        software.updateSoftware(
            {id:req.params.softwareId, name: req.body.name}, 
            function (err) {
            if (err) res.status(er.status).send(err.message);
            else res.json({success:"success"});
        })
    })
    .delete(function (req, res) {
        software.removeSoftware(req.params.softwareId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    });
//------------- LICENSES -----------------//
router.route('/software/:softwareId/licenses')
    .get(function (req, res) {
        licenses.getAllLicenses(req.params.softwareId, function (err, records) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(records); }
        });
    })
    .post(function (req, res) {
        licenses.addLicense(req.body, function (err, result) {
            res.json(result);
        });
    });
router.route('/software/:softwareId/licenses/:licenseId')
    .get(function (req, res) {
        licenses.getLicense(req.params.licenseId, function (err, record) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(record); }
        });
    })
    .put(function (req, res) {
        var license = {};
        license.expirationDate = req.body.expirationDate;
        license.allowedActivations = req.body.allowedActivations;
        license.userOrganizationName = req.body.userOrganizationName;
        license.softwareId = req.body.softwareId;
        licenses.updateLicense (req.params.licenseId, req.params.softwareId, license, function(err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .delete(function (req, res) {
        licenses.deleteLicense(req.params.licenseId, function(err) {
            if (err) 
                res.status(err.status).send(err.message);
            else
                res.json({"success": "success"});
        })
    });

//------------- ACTIVATIONS ------------------//
router.route('/software/:softwareId/licenses/:licenseId/activations')
    .get(function (req, res) {
        activations.getAllActivations(req.params.licenseId, req.params.softwareId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .post(function (req, res) {
        activations.addActivation(req.params.licenseId, req.body.activationId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .put(function (req, res) {
        activations.updateActivation(req.params.licenseId, req.body.activationId, req.body.newActivationId,
            function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .delete(function (req, res){
        activations.deleteActivation(req.params.licenseId, req.query.activationId,
            function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })

router.route('/software/:softwareId/licenses/:licenseId/activations/:activationId')
    .get(function (req, res) {
        activations.getActivation(req.params.activationId, req.params.licenseId, function (err, result) {
            if (err) { res.status(err.status).send(err.message); }
            else { res.json(result); }
        });
    })
    .put()
    .delete();

//---------- API to activate license for UI Web-Service ----------//
router.route('/software/:softwareId/licenses/:licenseId/activations/:activationId/license_file')
    .get(function (req, res) {
        activations.getActivation(req.params.activationId, req.params.licenseId, function (err, license) {
            software.getSoftware(req.params.softwareId, function (err, software) {
                if (err) { res.status(err.status).send(err.message); }
                else {
                    var fileStream = activations.createActivationFile(software.name, license, req.params.activationId);
                    console.log('fileStream: ' + fileStream);
                    if (fileStream instanceof Error) {
                        res.status(fileStream.status).send(fileStream.message);
                    }
                    else {
                        var fileName = 'license_' + license.licenseUniqueID.value.slice(0,8) + '_' + req.params.activationId.slice(0,5) + '.json';
                        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                        res.setHeader('Content-type', 'application/json');
                        res.end(fileStream);
                    }
                }
            });
        });
    });
//---------- Public API to activate license ----------//
router.route('/software/licenses/activations/activate') //assuming POST: licenseId=123&activationId=1234
    .post(function (req, res) {
        licenses.getLicense(req.body.licenseId, function (err, record) {
            software.getSoftware(record.softwareId, function (err, software) {
                if (err) { res.status(err.status).send(err.message); }
                else {
                    activations.addActivation(req.body.licenseId, req.body.activationId, function (err, result) {
                        if (err) { res.status(err.status).send(err.message); }
                        else {
                            var fileStream = activations.createActivationFile(software.name, record, req.body.activationId);
                            if (fileStream instanceof Error) {
                                res.status(fileStream.status).send(fileStream.message);
                            }
                            else {
                                var fileName = 'license_' + record.licenseUniqueID.value.slice(0,8) + '_' + req.params.activationId.slice(0,5) + '.json';
                                res.writeHead(200, "OK",
                                    {
                                        "Content-Type": "application/json",
                                        "Content-Disposition": "inline; attachment; filename="+fileName
                                    });
                                res.end(fileStream);
                            }
                        }
                    });
                }
            });
        });
    });


//User registration + Login

// Register user
router.route('/register')
.post( function(req, res)  {

try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    
    users.getUser(email, function (err, record) {
  
        if (record) {
             res.status(409).send("User Already Exist. Please Login");
        }   
    });
    
    //Encrypt user password
    var encryptedPassword =  bcrypt.hash(password, 10);

    // Create user in our database
    users.addUser({
      first_name,
      last_name,
      
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    },function(err,result){
        if (err) { res.status(err.status).send(err.message); }
            else {
                const user = result;
                // Create token
                const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                expiresIn: "2h",
                });
                // save user token
                user.token = token;
            
                // return new user
                res.status(201).json(user);
             }
    });

    
  } catch (err) {
    console.log(err);
  }
  
});
//register admin
router.route('/registerAdmin')
.post( function(req, res)  {

try {
    // Get user input
    const { first_name, last_name, email, password, appSecret } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }
    if(appSecret!==process.env.APP_SECRET){
        res.status(400).send("Please contact administrator to register as an Admin");
    }
    // check if user already exist
    // Validate if user exist in our database
    
    users.getUser(email, function (err, record) {
  
        if (record) {
            res.status(409).send("User Already Exist. Please Login");
        }   
    });
    
    //Encrypt user password
    var encryptedPassword =  bcrypt.hash(password, 10);

    // Create user in our database
    users.addAdmin({
      first_name,
      last_name,
      
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    },function(err,result){
        if (err) { res.status(err.status).send(err.message); }
            else {
                const user = result;
                // Create token
                const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                expiresIn: "2h",
                });
                // save user token
                user.token = token;
            
                // return new user
                res.status(201).json(user);
             }
    });

    
  } catch (err) {
    console.log(err);
  }
  
});

// Login
router.route('/login')
.post(async function (req, res)  {
// our login logic goes here
try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    users.getUser( email ,function(err,record){
        if (err) { res.status(err.status).send(err.message); }
        else {
            if (record && ( bcrypt.compare(password, record.password))) {
                // Create token
                const token = jwt.sign(
                  { user_id: record._id, email },
                  process.env.TOKEN_KEY,
                  {
                    expiresIn: "2h",
                  }
                );
          
                // save user token
                record.token = token;
          
                // user
                res.status(200).json(record);
              }
              else
                res.status(400).send("Invalid Credentials");
        }
    });
    
    
  } catch (err) {
    console.log(err);
  }

});

module.exports = router;