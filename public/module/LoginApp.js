define([
    'module',
    'angular',
    'module/kap-hal',
    'angular-easyfb'
], function(requireModule, angular) {
    
    var appConfig = requireModule.config();

    var module = angular.module('LoginApp', [
        'kap-hal',
        'ezfb'
    ]);

    module.config(function (ezfbProvider) {
        ezfbProvider.setInitParams({
            appId: appConfig.facebookAppId,
            version: 'v2.0'
        });
    });
    
    module.controller('FbLoginController', function($scope, ezfb, $http) {

        $scope.showLogin = false;
        
        $scope.logout = function() {
            ezfb.logout();
        }
        
        $scope.login = function() {
            ezfb.login(checkLoginStatus);
        }
        
        function checkLoginStatus(res) {
            if(res && res.status === 'connected') {
                $scope.showLogin = false;
                
                $http.post('/authenticate', {type: 'facebook_javascript'}).then(function(data) {
                    $scope.authResult = data.data;
                });
                
                return;
            }

            $scope.showLogin = true;
            $scope.loginStatus = res;
        }
        
        ezfb.getLoginStatus(checkLoginStatus);
    });

    module.factory('apiClient', function(HalClient) {
        var baseUrl = '/';
        return new HalClient(baseUrl);
    });
    
    return module;
});