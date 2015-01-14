define([
    'angular',
    'moment',
    'module/main-app',
    'angular-ui-router',
    'ngInfiniteScroll',
    'angular-loading-bar',
    'angular-google-maps',
    'module/kap-security'
], function(angular, moment) {

    var module = angular.module('client-app', [
        'main-app',
        'ui.router',
        'infinite-scroll',
        'angular-loading-bar',
        'kap-security',
        'uiGmapgoogle-maps'
    ]);
  
    module.config(function(uiGmapGoogleMapApiProvider) {
      uiGmapGoogleMapApiProvider.configure({
        //v: '3.17',
        //libraries: 'weather,geometry,visualization'
      });
    });
    
    module.run(function($rootScope) {
        //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    });

    module.controller('AlbumController', function($scope, $state,$modal, $stateParams, apiClient, HalCollection, $sce, page) {
        
        function loader() {
            var self = this;
            
            this.counter = 0;
            this.loading = false;
            
            this.load = function(promise) {
                self.counter++;
                
                promise.then(function() {
                    self.counter--;
                    check();
                });
                
                check();
            }
            
            function check() {
                if(self.counter) {
                    self.loading = true;
                    return;
                }

                self.loading = false;
            }
        }
        
        $scope.loader = new loader();

        var albumId = $stateParams.albumId;
        if(!albumId) {
            albumId = $state.current.albumId;
        }
        
        $scope.loadingAlbum = true;
        $scope.loadingItems = true;
        
        $scope.album = null;
        
        $scope.loader.load(apiClient.fetch('album_item', albumId).then(function(data) {
          $scope.album = data;
          page.setTitle($scope.album.name);
        }));
        
        $scope.albumItemRelCollection = new HalCollection('album_item_rel');
        $scope.loader.load($scope.albumItemRelCollection.fetch({
            query: {
                parent_id: albumId
            },
            page_size: 9999,
            order_by: {
                index: 'ASC'
            }
        }));
      
      $scope.showItemCaption = function(item) {
        return item.name || item.description;
      }
      
    });
  
  module.controller('TagFilterController', function($scope, $state, $modal, $stateParams, apiClient, page) {
      $scope.tag = null;
      
      apiClient.fetch('tag', $stateParams.tagId).then(function(tag) {
        $scope.tag = tag;
        page.setTitle("Search by tag: " + $scope.tag);
      });
      
  });

  module.controller('PageController', function($scope, $state, $modal, $stateParams, pageEntity, page) {
    $scope.mediumEditorOptions = {
      disableToolbar: true,
      disableEditing: true
    };

    $scope.page = pageEntity;
    page.setTitle(pageEntity.title);
  });

  module.controller('ContactController', function($scope, $http) {
    $scope.formData = {};
    $scope.status = '';
    $scope.sending = false;
    $scope.buttonLabel = 'Poslat';

    var location = {
      latitude: 48.2089941,
      longitude: 17.2077859
    };

    $scope.map = { center: location, zoom: 8 };

    $scope.windowOptions = {
    };

    $scope.marker = {
      id: 0,
      //icon: '/images/map-icon.png',
      coords: location,
      options: {
        draggable: false
      }
    };

    $scope.submitForm = function(form) {

      if(form.$invalid || $scope.status) {
        return;
      }
      
      $scope.status = 'SENDING';
      $scope.buttonLabel = 'Posilim ...'
      $http.post('/email', $scope.formData).then(function(res) {
        $scope.status = 'SENT';
        $scope.sending = false;
      }).catch(function(res) {
        $scope.status = 'ERROR';
        $scope.error = 'Nastala chyba pri posielani. Prosim zavolajte nam.'
      });
    }
  });

  return module;
  
});