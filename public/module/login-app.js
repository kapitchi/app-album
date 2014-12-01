define([
    'module',
    'angular',
    'module/kap-hal',
    'angular-easyfb',
    'module/kap-security'
], function(requireModule, angular) {
    
    var appConfig = requireModule.config();

    var module = angular.module('login-app', [
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
  
    module.controller('FbLoginController', function($scope, ezfb, $http, authenticationService, $window, $location, fbAuthUrl) {

      function getToken() {
        var hash = $location.hash();
        
        var params = {},
          regex = /([^&=]+)=([^&]*)/g,
          m;

        while (m = regex.exec(hash)) {
          params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }

        if(params.access_token || params.error){
          return params;
        }
      }
      
      $scope.showLogin = false;

      var token = getToken();
      
      if(token && token.access_token) {
        authenticationService.setToken(token).then(function() {
          $window.location = '/?admin=1'
        });
        return;
      }

      $scope.logout = function() {
          ezfb.logout();
      }
      
      $scope.login = function() {
          ezfb.login(checkLoginStatus);
      }
      
      function checkLoginStatus(res) {
        
        if(res && res.status === 'connected') {
            $scope.showLogin = false;
            
            $window.location = fbAuthUrl;
            
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