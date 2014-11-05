define([
  'module',
  'angular',
  'moment',
  'ngstorage',
  'angular-sanitize',
  'angular-ui-router',
  'angular-bootstrap',
  'angular-moment',
  'module/kap-hal'
], function(requireModule, angular, moment) {

  //moment stuff
  //http://momentjs.com/docs/#/customization/calendar/
  moment.locale('en-GB', {
    calendar : {
      lastDay : '[Yesterday]',
      sameDay : '[Today]',
      nextDay : '[Tomorrow]',
      lastWeek : '[last] dddd',
      nextWeek : '[this] dddd',
      sameElse : 'L'
    }
  });
  //END - moment

  var module = angular.module('main-app', [
    'ngStorage',
    'ngSanitize',
    'ui.bootstrap',
    'ui.router',
    'angularMoment',
    'kap-hal'
  ]);
  
  module.constant('serverConfig', requireModule.config());

  module.config(function(datepickerConfig, datepickerPopupConfig, $provide) {

    angular.extend(datepickerConfig, {

    });

    angular.extend(datepickerPopupConfig, {
      datepickerPopup: 'dd/MM/yyyy'
    });

    //TODO FIX http://stackoverflow.com/questions/21714655/angular-js-angular-ui-router-reloading-current-state-refresh-data
    $provide.decorator('$state', function($delegate, $stateParams) {
      $delegate.forceReload = function() {
        return $delegate.go($delegate.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        });
      };
      return $delegate;
    });

  });

  module.config(function($stateProvider, $urlRouterProvider, $provide, datepickerConfig, datepickerPopupConfig, serverConfig) {

    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'template/app.html',
        controller: 'AppController'
      })
      .state('app.home', {
        url: "/home",
        views: {
          'content': {
            controller: "AlbumController",
            templateUrl: "template/album.html"
            
          },
          'contact': {
            controller: 'ContactController',
            templateUrl: 'template/contact.html'
          }
        },
        albumId: serverConfig.homeAlbumId
      })
      .state('app.home.album', {
        url: "/album/:albumId",
        views: {
          'content@app': {
            controller: "AlbumController",
            templateUrl: "template/album.html"
          }
        }
      })
      .state('app.home.tag', {
        url: "/tag/:tagId",
        views: {
          'content@app': {
            controller: "TagFilterController",
            templateUrl: "template/tag-filter.html"
          }
        }
      })
      .state('app.login', {
        url: "/login",
        templateUrl: "template/KapLogin/login.html",
        controller: 'loginController'
      })

    $urlRouterProvider.otherwise("/home");
  });

  module.factory('apiClient', function(HalClient) {
    var baseUrl = '/';
    var client = new HalClient(baseUrl);
    HalClient.default = client;
  
    return client;
  })

  module.controller('AppController', function($rootScope, apiClient, $modal, authenticationService, $sessionStorage, $state, serverConfig) {

    $sessionStorage.$default({
      edit: false
    });
    
    var mainNav = serverConfig.mainNavigation;
    
    for(var i in mainNav) {
      var nav = mainNav[i];
      
      nav.href = $state.href(nav.state.name, nav.state.params);
    }

    $rootScope.app = {
      edit: $sessionStorage.edit,
      nav: {
        collapsed: true,
        main: mainNav
      }
    };
    
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $rootScope.app.nav.collapsed = false;  
    });
    
    $rootScope.$auth = authenticationService;

    $rootScope.fullScreenGallery = function(albumItems, current) {

      var modalInstance = $modal.open({
        templateUrl: 'template/fullscreen-gallery.html',
        controller: function($scope, $modalInstance, apiClient, $sce, $timeout) {
          var currentIndex = 0;
          var controlPanelTimer = null;

          $scope.renderControlPanel = true;
          $scope.currentItem = null;
          $scope.albumItems = albumItems;

          $timeout(function() {
            $scope.setCurrent(current);

            runControlPanelTimer();
          });

          $scope.showControlPanel = function() {
            $scope.renderControlPanel = true;
            runControlPanelTimer();
          }

          function runControlPanelTimer() {
            if(controlPanelTimer) {
              $timeout.cancel(controlPanelTimer);
            }

            controlPanelTimer = $timeout(function() {
              $scope.renderControlPanel = false;
            }, 3000);
          }

          $scope.nextItem = function() {
            ++currentIndex;

            if(currentIndex >= albumItems.length) {
              currentIndex = 0;
            }

            $scope.currentItem = albumItems[currentIndex];
          }

          $scope.previousItem = function() {
            currentIndex--;
            if(currentIndex < 0) {
              currentIndex = albumItems.length - 1;
            }

            $scope.currentItem = albumItems[currentIndex];
          }

          $scope.setCurrent = function(item) {
            currentIndex = albumItems.indexOf(item);
            $scope.currentItem = albumItems[currentIndex];
          }

          $scope.getYoutubeVideoEmbedUrl = function(albumItem) {
            var url = 'http://www.youtube.com/embed/' + albumItem.youtube_video_id + '?rel=0&autoplay=1&';
            return $sce.trustAsResourceUrl(url);
          }
        },
        windowClass: 'full-screen',
        size: 'lg'
      });

      return modalInstance.result;
    };

    $rootScope.fullScreenGalleryRel = function(albumItemRelCollection, albumItemRel) {
      var items = [];
      var current = null;
      angular.forEach(albumItemRelCollection.items, function(itemRel) {
        var item = itemRel._embedded.album_item;
        if(itemRel === albumItemRel) {
          current = item;
        }
        items.push(item);
      })

      return $rootScope.fullScreenGallery(items, current);
    };

    $rootScope.fullScreenGalleryAlbum = function(album) {
      return apiClient.fetchAll('album_item_rel', {
          album_id: album.id
        },
        {
          index: 'ASC'
        }
      ).then(function(data) {
          var items = [];
          var current = null;
          angular.forEach(data._embedded.album_item_rel, function(itemRel) {
            var item = itemRel._embedded.album_item;
            items.push(item);
          })

          return $rootScope.fullScreenGallery(items, current);
        });
    };
    
  });

  module.controller('XXXController', function($rootScope, apiClient, authenticationService, $sessionStorage) {
    console.log($sessionStorage, 'XXX'); //XXX

  });

  module.directive('stopEvent', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.bind('click', function (e) {
          e.stopPropagation();
        });
      }
    };
  });

  module.directive('localDateToString', function($filter) {
    function link(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        if(value instanceof Date) {
          return $filter('date')(value, "yyyy-MM-ddT00:00:00'Z'", 'UTC');
        }

        return value;
      });
    }

    return {
      require: 'ngModel',
      link: link
    }
  })

  module.directive('extendController', function($controller) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs) {
        try {
          var controller = $controller($attrs.extendController, {
            $scope: $scope,
            $element: $element,
            $attrs: $attrs
            //$transclude: transcludeFn
          });
        } catch(e) {};
      }
    };
  });
  
  return module;
  
});