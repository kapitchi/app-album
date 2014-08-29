define([
    'angular',
    'module/kap-hal',
    'module/kap-security'
], function(angular) {

    var module = angular.module('LoginApp', [
        'kap-hal',
        'KapSecurity'
    ]);

    module.factory('apiClient', function(HalClient) {
        var baseUrl = '/';
        return new HalClient(baseUrl);
    });
    
    return module;
});