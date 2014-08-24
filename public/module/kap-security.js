define(['angular', 'module/SharedRegistry'], function(angular) {

    var module = angular.module('KapSecurity', ['SharedRegistry']);

    module.service('authenticationService', function(apiClient, $window) {

        this.identity = null;
        this.userProfile = null;

        this.identity = $window.sessionStorage.getItem('identityId');

        this.handleResult = function(result) {
            this.identity = result.identityId;
            this.userProfile = result.userProfile;

            $window.sessionStorage.setItem('identityId', this.identity);
        }
        
        this.logout = function() {
            this.identity = null;
            this.userProfile = null;
            $window.sessionStorage.removeItem('identityId');
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
        $timeout(function() {
            $http.get('/authentication_service').success(function(data) {
                $scope.authenticationOptions = data._embedded.authentication_service.filter(function(item) {
                    return item.enabled;
                });
            });
        });

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
        $scope.openDialog = function(option) {
            $scope.status.state = 'IN_PROGRESS';

            dialog = $window.open(option._links.redirect_url.href, "Login dialog", "width=1024,height=768,dialog=1,location=1,status=1,minimizable=0,close=0,dependent");
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