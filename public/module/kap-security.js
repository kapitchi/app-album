define(['angular', 'module/shared-registry', 'ngstorage'], function(angular) {

    var module = angular.module('kap-security', ['shared-registry', 'ngStorage']);

    module.config(function($httpProvider) {
      
      $httpProvider.interceptors.push(function($sessionStorage) {
        return {
          'request': function(config) {
            var token = $sessionStorage.identityToken;
            if(!token) {
              return config;
            }
            
            config.headers.Authorization = token.token_type + ' ' + token.access_token;
            
            return config;
          }
        };
      });
      
    });

    module.service('authenticationService', function(apiClient, $window, $sessionStorage, $http) {

        this.identity = $sessionStorage.identity;
        this.token = $sessionStorage.identityToken;
        //this.identity = 1;
      
        this.setToken = function(token) {
          this.token = token;

          $sessionStorage.identityToken = token;

          return $http.get('/me').then(function(resp) {
            this.identity = resp.data;
            $sessionStorage.identity = this.identity;
          });
        }
      
        this.logout = function() {
            this.identity = null;
            this.token = null;
          
            delete $sessionStorage.identity;
            delete $sessionStorage.identityToken;
        }
    })

    module.controller('LoginController', function($scope, $http, $timeout, $window, sharedRegistry, authenticationService) {
        var dialog;

        $scope.authenticationOptions = [];

        var result = {
            code: 0,
            identityId: null,
            messages: [],
            userProfile: null
        };

        $scope.status = {
            state: 'NONE',//NONE, IN_PROGRESS, RESULT
            result: null
        }

        $scope.authenticationService = authenticationService;

        //init
//        $timeout(function() {
//            $http.get('/authentication_service').success(function(data) {
//                $scope.authenticationOptions = data._embedded.authentication_service.filter(function(item) {
//                    return item.enabled;
//                });
//            });
//        });

        sharedRegistry.register('LoginController.status', $scope, 'status');

        $scope.$watch('status', function(status) {

            if(status.state === 'RESULT') {
                var result = status.result;
                if(!result) {
                    throw "loginController: result not available in status";
                }

                authenticationService.handleResult(result);

                status.state = 'NONE';

                $scope.closeDialog();
            }

        }, true);

        //scope functions
        $scope.openDialog = function() {
            $scope.status.state = 'IN_PROGRESS';
          
            $window.location = '/login';
          return;

            dialog = $window.open('/login', "Login dialog", "width=1024,height=768,dialog=1,location=1,status=1,minimizable=0,close=0,dependent");
        }

        $scope.closeDialog = function() {
            if(!dialog) {
                return;
            }

            dialog.close();
        }

    });

    module.controller('LoginCallbackController', function($scope, sharedRegistry, loginCallbackResult) {

        var status = sharedRegistry.get('LoginController.status');

        status.state = 'RESULT';
        status.result = loginCallbackResult;

        sharedRegistry.notify('LoginController.status');

        $scope.status = status;
    });
    
    return module;

});