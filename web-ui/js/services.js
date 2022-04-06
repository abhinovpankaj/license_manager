/* jshint undef: true, unused: true */
/* globals angular */
/* jshint strict: true */
/* jshint unused:true */
"use strict";
angular.module('appServices', []).factory('SoftwareFactory', function ($resource) {
    let token = localStorage.getItem("licensemanage_token")
    // return $resource('/api/software/:id', {id: '@_id'}, {
    //     update: {
    //         method: 'PUT',
    //         headers: {
    //             'x-access-token': token
    //         }
    //     }
    // });
    
    return $resource('/api/software/:id', {id: '@_id'}, {
        
        query: {
            method:'GET', isArray:true,
            headers: {
                'x-access-token': token
            }
        },
        save: {
            method: 'POST',
            headers: {
                'x-access-token': token
            }
        },
        update: {
            method: 'PUT',
            headers: {
                'x-access-token': token
            }
        },
        delete: {
            method: 'DELETE',
            headers: {
                'x-access-token': token
            }
        }
    });
}).factory('ClientInfoFactory', function ($resource) {
    let token = localStorage.getItem("licensemanage_token")
    return $resource('/api/getClientInfo', {}, {
        query: {method: 'GET', isArray:true,
        headers: {
            'x-access-token': token
        }
    }
    });
}).factory('LicensesFactory', function ($resource) {
    let token = localStorage.getItem("licensemanage_token")
    return $resource('/api/software/:softwareId/licenses/:id', {id: '@_id', softwareId: '@softwareId'}, {
        query: {
            method:'GET', isArray:true,
            headers: {
                'x-access-token': token
            }
        },
        update: {
            method: 'PUT',
            headers: {
                'x-access-token': token
            }
        }
    });
}).factory('DevicesListFactory',function($resource){
    let token = localStorage.getItem("licensemanage_token")
    return $resource('/api/software/:softwareId/licenses/:id', {id: '@_id', softwareId: '@softwareId'}, {
        query: {
            method:'GET', isArray:true,
            headers: {
                'x-access-token': token
            }
        },
        update: {
            method: 'PUT',
            headers: {
                'x-access-token': token
            }
        }
    });
}).factory('DevicesFactory', function ($resource) {
    let token = localStorage.getItem("licensemanage_token")
    return $resource('/api/software/:softwareId/licenses/:licenseId/activations/:id', {id: '@_id', softwareId: '@softwareId', licenseId: '@licenseId'}, {
        query: {
            method:'GET', isArray:true,
            headers: {
                'x-access-token': token
            }
    },
        update: {
            method: 'PUT',
            headers: {
                'x-access-token': token
            }
        }
    });
}).factory('LicenseFileFactory', function ($resource) {
    let token = localStorage.getItem("licensemanage_token")
    return $resource('/api/software/:softwareId/licenses/:licenseId/activations/:activationId/license_file', {
        softwareId: '@softwareId',
        licenseId: '@licenseId',
        activationId: '@activationId'
    }, {});
}).factory('HomeFactory', function ($resource) {
    return $resource('/api/auth', {}, {
        login: {method: 'POST'},
        register: {method: 'PUT'}
    })
}).factory('authorizationService', function ($resource, $q, $rootScope, $location) {
 
}).config(function($httpProvider) {
    let token = localStorage.getItem("licensemanage_token")
    $httpProvider.defaults.headers.common['x-access-token'] = token;
    // For angular 1.5, use:  
    // $httpProvider.defaults.headers.common['Authorization'] = token;        
});