/* jshint undef: true, unused: true */
/* globals angular */
/* jshint strict: true */
/* jshint unused:true */
"use strict";
angular.module('appControllers', []).controller('SoftwareController', function ($scope,$location, SoftwareFactory) {
    let ur = localStorage.getItem("ur");
    let token = localStorage.getItem("licensemanage_token")
    if (ur != "admin" || !token)
        $location.path("/home");

    $scope.current = null;
    $scope.current_name = "";

    $scope.edit = function (item) {
        $scope.current = item;
        $scope.current_name = item.name;
    }

    $scope.isShown = false;
    $scope.getSoftware = function () {
        $scope.softwares = SoftwareFactory.query(function (data) {
            if (data.length > 0) {$scope.isShown = true;}
        });
    };
    $scope.getSoftware();
    $scope.software = new SoftwareFactory();
    $scope.createSoftware = function () {
        $scope.isSaving = true;
        $scope.software.$save(function () {
            $scope.isSaving = false;
            $scope.inputForm.$setPristine();
            $scope.getSoftware();
        });
    };
    $scope.editSoftware = function () {
        $scope.current.name = $scope.current_name;
        $scope.current.$update(function () {
            $scope.editForm.$setPristine();
            $scope.getSoftware();
        });
    }
    $scope.deleteSoftware = function (item) {
        if (confirm("Are you going to delete it?") == true) {
            item.$delete(function() {
                $scope.getSoftware();
            })
        }
    }
    $scope.seeDetail = function (item) {
        let path = 'software/' + item._id + '/licenses';
        $location.path(path);
    }
})
.controller('HomeController', function ($scope, $location, HomeFactory) {
    $scope.status = new HomeFactory();
    
    let token = localStorage.getItem("licensemanage_token");
    let ur = localStorage.getItem("ur");
    if (!token && ur == "admin") {
        $location.path('/software')
    }
    $scope.loginInfo = {};
    $scope.registerInfo = {};
    $scope.errorMessage = "";
    
    $scope.login = function () {
        console.log($scope.loginInfo);
        $scope.status.$login({email: $scope.loginInfo.email, password: $scope.loginInfo.password}, function(res) {
            if (res.err) {
                alert (res.msg);
            } else {
                localStorage.setItem("licensemanage_token", res.token);
                localStorage.setItem("ur", res.role);
                if (ur == "user")
                    $location.path("");
                else
                    $location.path("/software");
            }
        });
    }

    $scope.register = function () {
        //simple validation
        if ($scope.registerInfo.password != $scope.registerInfo.passwordConfirm) {
            alert("Password and confirm doesn't match.");
            return ;
        }
        $scope.status.$register({...$scope.registerInfo}, function (res) {
            if (res.err) {
                alert (res.msg);
            } else {
                alert ("You are successfuly registered.");
            }
        });
    }
})
.controller('LicensesController', function ($scope, $location, $routeParams, SoftwareFactory, LicensesFactory) {
    let ur = localStorage.getItem("ur");
    let token = localStorage.getItem("licensemanage_token")
    if (!token)
        $location.path("/home");
    $scope.isShown = false;
    $scope.getLicenses = function () {
        $scope.licenses = LicensesFactory.query({softwareId: $routeParams.softwareId}, function (data) {
            if (data.length > 0) {$scope.isShown = true;}
        });
    };
    $scope.current = null;
    $scope.current_item = null;
    $scope.edit = function (item) {
        $scope.current = item;
        $scope.current_item = {...item};
    }
    $scope.showDetail = function (item) {
        let path = "software/" + $scope.software._id + "/licenses/" + item._id + "/devices";
        $location.path(path);
    }
    $scope.editLicense = function () {
        $scope.current.userOrganizationName = $scope.current_item.userOrganizationName;
        $scope.current.expirationDate = $scope.current_item.expirationDate;
        $scope.current.allowedActivations = $scope.current_item.allowedActivations;
        console.log($scope.current);
        $scope.current.$update(function () {
            $scope.editForm.$setPristine();
            $scope.getLicenses();
        })
    }
    $scope.deleteLicense = function (item) {
        if (confirm("Are you going to delete it?") == true) {
            item.$delete(function() {
                $scope.getLicenses();
            })
        }
    }
    $scope.getLicenses();

    $scope.software = SoftwareFactory.get({id: $routeParams.softwareId});

    $scope.license = new LicensesFactory();
    $scope.createLicense = function () {
        $scope.isSaving = true;
        $scope.license.softwareId = $routeParams.softwareId;
        $scope.license.$save({softwareId: $routeParams.softwareId}, function () {
            $scope.inputForm.$setPristine();
            $scope.isSaving = false;
            $scope.getLicenses();
        });
    };

    //----- Date Picker ------//
    $scope.today = function() { $scope.dt = new Date(); };
    $scope.today();
    $scope.clear = function () { $scope.dt = null; };
    $scope.open = function($event) { $scope.status.opened = true; };
    $scope.setDate = function(year, month, day) { $scope.dt = new Date(year, month, day); };
    $scope.status = { opened: false };

    $scope.editStatus = { opened: false };
    $scope.editOpen = function($event) {$scope.editStatus.opened = true;};
    $scope.showButtonBar = false;

}).controller('DevicesController', function ($http, $scope, $routeParams, SoftwareFactory, DevicesFactory, LicensesFactory) {
    let ur = localStorage.getItem("ur");
    let token = localStorage.getItem("licensemanage_token")
    if (ur != "admin" || !token)
        $location.path("/home");
    $scope.software = SoftwareFactory.get({id: $routeParams.softwareId});
    $scope.isShown = false;
    $scope.getLicense = function () {
        $scope.license = LicensesFactory.get({id: $routeParams.licenseId, softwareId: $routeParams.softwareId}, function () {
            $scope.devices = $scope.license.issuedLicenses;
            if ($scope.devices.length > 0) {$scope.isShown = true;}
        });
    };
    $scope.getLicense();

    $scope.current = new DevicesFactory();
    $scope.current.softwareId = $routeParams.softwareId;
    $scope.current.licenseId = $routeParams.licenseId;
    $scope.current_activationId = "";
    
    $scope.edit = function (item) {
        $scope.current.activationId = item.activationId;
        $scope.current_activationId = item.activationId;
    }

    $scope.editDevice = function () {
        $scope.current.newActivationId = $scope.current_activationId;
        $scope.current.$update(function () {
            $scope.editForm.$setPristine();
            $scope.getLicense();
        })
    }

    $scope.deleteDevice = function (item) {
        if (confirm("Are you going to delete it?") == true) {
            $scope.current.activationId = item.activationId;
            $scope.current.$remove({activationId: item.activationId}, function () {
                $scope.getLicense();
            })
        }
    }

    $scope.device = new DevicesFactory();
    $scope.createDevice = function () {
        $scope.isSaving = true;
        if ($scope.license.allowedActivations - $scope.license.issuedLicenses.length > 0) {
            $scope.device.licenseId = $routeParams.licenseId;
            $scope.device.$save({softwareId: $routeParams.softwareId, licenseId: $routeParams.licenseId}, function () {
                $scope.isSaving = false;
                $scope.inputForm.$setPristine();
                $scope.getLicense();
            });
        } else { console.log('In $scope.createDevice, $scope.activeActivations <= 0'); }
    };
});