define([
    'angular',
    'moment',
    'module/main-app',
    'angular-ui-router',
    'ngInfiniteScroll',
    'ng-preload-src',
    'angular-loading-bar',
    'module/kap-security'
], function(angular, moment) {

    var module = angular.module('client-app', [
        'main-app',
        'ui.router',
        'infinite-scroll',
        'ng-preload-src',
        'angular-loading-bar',
        'kap-security'
    ]);
    
    module.run(function($rootScope) {
        //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    });

    module.controller('ContactController', function($scope) {
        $scope.test = 'DDDD';
    });

    module.controller('AlbumController', function($scope, $state,$modal, $stateParams, apiClient, HalCollection, $sce) {
        
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
      
    });
  

  module.controller('AlbumCollectionController', function($scope, $state, $modal, $stateParams, apiClient, HalCollection) {

    $scope.albumCollection = HalCollection.createAndFetch('album', {
        order_by: {
            album_time: 'DESC'
        }
    });
  });
  
  module.controller('TagFilterController', function($scope, $state, $modal, $stateParams, apiClient) {
      $scope.tag = null;
      
      apiClient.fetch('tag', $stateParams.tagId).then(function(tag) {
          $scope.tag = tag;
      });
      
  });

  module.controller('PageController', function($scope, $state, $modal, $stateParams, pageEntity) {
    $scope.mediumEditorOptions = {
      disableToolbar: true,
      disableEditing: true
    };

    $scope.page = pageEntity;
  });

  module.controller('ContactController', function($scope) {
    $scope.formData = {};
    
    $scope.submitForm = function(data) {
      console.log(data); //XXX
    }
  });

  return module;
  
});