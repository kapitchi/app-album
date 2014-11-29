define([
    'module',
    'angular',
    'oauth-ng',
    'module/kap-hal',
    'angular-easyfb',
    'module/kap-security'
], function(requireModule, angular) {
    
    var appConfig = requireModule.config();

    var module = angular.module('login-app', [
        'oauth',
        'kap-hal',
        'ezfb',
        'kap-security'
    ]);

    module.config(function (ezfbProvider, $locationProvider) {
        ezfbProvider.setInitParams({
            appId: appConfig.facebookAppId,
            version: 'v2.0'
        });

        $locationProvider.html5Mode(true).hashPrefix('!');
    });
  
    module.run(function($rootScope, authenticationService, $sessionStorage) {
      
      $rootScope.$on('oauth:login', function(event, token) {
        authenticationService.setToken(token);
        
        //delete token stored by oauth module
        delete $sessionStorage.token;
      });
      
    });
    
    module.controller('FbLoginController', function($scope, ezfb, $http, authenticationService, $window, fbAuthUrl) {

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
                
                //$window.location = fbAuthUrl;
                
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