define([
  'module',
  'angular',
  'moment',
  'ngstorage',
  'angular-sanitize',
  'angular-ui-router',
  'angular-bootstrap',
  'angular-messages',
  'angular-moment',
  'module/kap-hal',
  'angular-easyfb'
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
    'ngMessages',
    'angularMoment',
    'kap-hal',
    'ezfb'
  ]);

  module.config(function (ezfbProvider, $locationProvider, serverConfig) {
    ezfbProvider.setInitParams({
      appId: serverConfig.facebookAppId,
      version: 'v2.0'
    });

    $locationProvider.html5Mode(true).hashPrefix('!');
  });
  
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

  module.config(function($stateProvider, $urlRouterProvider, $provide, $locationProvider, datepickerConfig, datepickerPopupConfig, serverConfig) {

    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: '/template/app.html',
        controller: 'AppController'
      })
      .state('app.home', {
        url: "/",
        views: {
          'content': {
            controller: "AlbumController",
            templateUrl: "/template/album.html"
            
          }
        },
        albumId: serverConfig.homeAlbumId
      })
      .state('app.album', {
        url: "/album/:albumId",
        views: {
          'content@app': {
            controller: "AlbumController",
            templateUrl: "/template/album.html"
          }
        }
      })
      .state('app.tag', {
        url: "/tag/:tagId",
        views: {
          'content@app': {
            controller: "TagFilterController",
            templateUrl: "/template/tag-filter.html"
          }
        }
      })
      .state('app.contact', {
        url: "/contact",
        views: {
          'content@app': {
            controller: "ContactController",
            templateUrl: "/template/contact.html"
          }
        }
      })
      .state('app.page', {
        url: "/p/:key",
        views: {
          'content@app': {
            controller: "PageController",
            templateUrl: "/template/page.html"
          }
        },
        resolve: {
          pageEntity: function($stateParams, apiClient) {
            //try {
              return apiClient.fetchAll('page', {
                query: {
                  key: $stateParams.key
                }
              }).then(function(data) {
                if(data._embedded.page[0]) {
                  return data._embedded.page[0];
                }

                return {
                  key: $stateParams.key
                }
              }, function() {
                
              });
            //} catch(e) {
              //console.log(e); //XXX
            //}
          }
        }
      })

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise("/");
    
  });

  module.factory('apiClient', function(HalClient) {
    var baseUrl = '/';
    var client = new HalClient(baseUrl);
    HalClient.default = client;
  
    return client;
  })

  /**
   * todo we should move stuff into state resolve - e.g. app scope param
   */
  module.controller('AppController', function($rootScope, apiClient, $modal, authenticationService, $sessionStorage, $state, $window, $location, serverConfig, page) {

    $sessionStorage.$default({
      edit: false
    });
    
    var mainNav = serverConfig.mainNavigation;
    
    for(var i in mainNav) {
      var nav = mainNav[i];
      
      nav.href = $state.href(nav.state.name, nav.state.params);
    }
    
    $rootScope.page = page.model;
    $rootScope.$window = $window;

    $rootScope.app = {
      edit: $sessionStorage.edit,
      nav: {
        collapsed: true,
        main: mainNav
      }
    };
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $rootScope.app.nav.collapsed = true;  
    });
    
    $rootScope.$auth = authenticationService;

    $rootScope.login = function() {
      $window.location = '/login';
    }

    $rootScope.logout = function() {
      $rootScope.app.edit = false;
      authenticationService.logout();
    }

    //admin query param (/?admin=1) is used to load admin-app module instead of client-app only 
    if(!$location.search().admin) {
      //logged in? - we need admin module too
      if(authenticationService.identity) {
        $window.location = $window.location.href + '?admin=1';
        return;
      }
      
      //edit enabled and not authenticated? - disable edit
      $rootScope.app.edit = false;
    }

    $rootScope.fullScreenGallery = function(albumItems, current) {

      var modalInstance = $modal.open({
        templateUrl: '/template/fullscreen-gallery.html',
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
  
  module.service('page', function($rootScope) {
    this.model = {
      title: ''
    };
    
    this.setTitle = function(title) {
      this.model.title = title;
    };

    this.setClassName = function(className) {
      this.model.className = className;
    };
  });

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

  module.filter('htmlToPlaintext', function() {
      return function(text) {
        if(!text) {
          return '';
        }
        return String(text).replace(/<[^>]+>/gm, '');
      }
    }
  );
  
  return module;
  
});