define([
    'angular',
    'module/kap-hal',
    'module/kap-security'
], function(angular) {

    var module = angular.module('LoginApp', [
        'KapHal',
        'KapSecurity'
    ]);

    module.factory('apiClient', function(KapHalClient) {
        var baseUrl = '/';
        return new KapHalClient(baseUrl);
    });
    
    return module;
});