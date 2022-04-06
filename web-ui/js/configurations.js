/* jshint undef: true, unused: true */
/* globals angular */
/* jshint strict: true */
/* jshint unused:true */
"use strict";
angular.module('appConfigurations', []).config(function ($routeProvider) {
    $routeProvider
    .when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    })
    .when('/software', {
        templateUrl: 'partials/software.html',
        controller: 'SoftwareController'
    }).when('/software/:softwareId/licenses', {
        templateUrl: 'partials/licenses.html',
        controller: 'LicensesController'
    }).when('/software/:softwareId/licenses/:licenseId/activations', {
        templateUrl: 'partials/devices.html',
        controller: 'DevicesController'
    }).when('/404', {
        templateUrl: 'partials/error.html'
    }).when('/client-info', {
        templateUrl: 'partials/clientInfo.html',
        controller: 'ClientInfoController'
    }).when('/', {
        redirectTo: '/home'
    }).otherwise({redirectTo: '/404'});
});
