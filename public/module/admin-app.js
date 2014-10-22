define([
  'angular',
  'moment',
  'module/main-app',
  'module/client-app',
  'module/ng-fabric',
  'angular-ui-tree',
  'ng-tags-input',
  'textAngular',
  'ngImgCrop',
  //'angular-xeditable',
  //'module/KapLogin',
  'module/kap-security',
  'module/KapFileManager',
  'module/ng-darkroom'
  //'module/KapAlbum'
], function(angular, moment) {

  var module = angular.module('admin-app', [
    'main-app',
    'client-app',
    'ng-fabric',
    'ui.tree',
    'ngTagsInput',
    'textAngular',
    'ngImgCrop',
    //'xeditable',
    //'KapLogin',
    'KapSecurity',
    'KapFileManager',
    'ng-darkroom'
    //'KapAlbum'
  ]);

  module.config(function($stateProvider, $urlRouterProvider, $provide) {

  });

  module.run(function($rootScope) {
    //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'

  });

  module.controller('AdminAppController', function($rootScope, $scope, $modal, $state, apiClient, authenticationService, $window, $sessionStorage) {

    $rootScope.logout = function() {
      authenticationService.logout();
      $window.location = '/logout';
    }

    $rootScope.login = function() {
      $window.location = '/login';
    }

    $rootScope.toggleEdit = function() {

      $rootScope.app.edit = $sessionStorage.edit = !$rootScope.app.edit;
    }

    $rootScope.albumItemUpdate = function(item) {
      var modalInstance = $modal.open({
        templateUrl: 'template/album-item-edit-modal.html',
        controller: 'AlbumItemModalController',
        resolve: {
          albumItem: function() {
            return item;
          }
        },
        size: 'lg'
      });

      return modalInstance.result;
    }

    $rootScope.albumItemCreate = function() {
      var modalInstance = $modal.open({
        templateUrl: 'template/album-item-edit-modal.html',
        controller: 'AlbumItemModalController',
        resolve: {
          albumItem: function() {
            return {
              type: 'FILE',
              file_id: null
            }
          }
        },
        size: 'lg'
      });

      return modalInstance.result;
    }

    $rootScope.albumItemRelRemove = function(collection, item) {
      return collection.remove(item, true);
    }

    $rootScope.albumCreate = function() {
      var modalInstance = $modal.open({
        templateUrl: 'template/album-edit.html',
        controller: function($scope, $modalInstance, apiClient) {
          //$scope.item = item;
          $scope.item = {}

          $scope.save = function(item) {
            item.create_time = moment().format('YYYY-MM-DDTHH:mm:ss');
            apiClient.create('album', item).then(function(data) {
              $modalInstance.close(data);
            });
          }
        },
        size: 'lg'
      });

      return modalInstance.result;
    }

    $rootScope.albumUpdate = function(album) {
      var modalInstance = $modal.open({
        templateUrl: 'template/album-edit.html',
        controller: function($scope, $modalInstance, apiClient) {
          $scope.item = album;
          $scope.save = function(item) {
            apiClient.update('album', item.id, item).then(function(data) {
              angular.extend(item, data);
              $modalInstance.close(data);
            });
          }
        },
        size: 'lg'
      });

      return modalInstance.result;
    }

  });

  module.controller('AlbumItemModalController', function($scope, $modalInstance, apiClient, albumItem, $http, $q) {
    $scope.item = albumItem;

    $scope.save = function() {

      if($scope.item.id) {
        apiClient.update('album_item', $scope.item.id, $scope.item).then(function(data) {
          angular.extend(albumItem, data);
          $modalInstance.close(albumItem);
        });
        return;
      }

      apiClient.create('album_item', $scope.item).then(function(data) {
        $modalInstance.close(data);
      });
    }

  });

  module.directive('albumItemForm', function() {
    return {
      templateUrl: 'template/album-item-form.html',
      scope: {
        item: '='
      },
      controller: 'AlbumItemFormController'
    }
  });

  module.controller('AlbumItemFormController', function($scope, apiClient, $http, $q, globalFileUploader, fabricUtils) {
    //$scope.item = albumItem;

    $scope.thumbnails = [];
    $scope.selectedThumbnail = null;
    $scope.preview = {
      
    };

    $scope.selectThumbnailUrl = function(thumb) {
      $scope.selectedThumbnail = thumb;
      $scope.item.thumbnail_file_url = thumb.url;
    }

    $scope.loadYoutubeThumbnails = function() {
      var videoId = $scope.item.youtube_video_id;

      $http.get('http://gdata.youtube.com/feeds/api/videos/' + videoId + '?v=2&alt=json').then(function(data) {
        for(var i in data.data.entry['media$group']['media$thumbnail']) {
          var thumb = data.data.entry['media$group']['media$thumbnail'][i];
          if(thumb['yt$name'] === 'sddefault') {
            $scope.selectThumbnailUrl({
              url: thumb['url']
            });
            return;
          }
        }
      });
    }

    $scope.loadTags = function(query) {
      return apiClient.fetchAll('tag', {
        query: {
          fulltext: query
        }
      }).then(function(data) {
        return data._embedded.tag;
      });
    }

    $scope.tagAdded = function(tag) {
      if(!tag.id) {
        //create new
        apiClient.create('tag', tag).then(function(data) {
          angular.extend(tag, data);
        });
      }
    }

    function setThumbnailFile(response) {
      $scope.item.thumbnail_file_id = response.id;
      $scope.item._embedded.thumbnail_file = response;
    }

    $scope.saveThumbnail = function(dataURL) {
      console.log(dataURL); //XXX
      var blob = fabricUtils.dataUriToBlob(dataURL);
      console.log(blob); //XXX

      globalFileUploader.addToQueue(blob, {
        formData: [{
          filesystem: 'album_item_thumbnail'
        }],
        onSuccess: function(response) {
          setThumbnailFile(response);
        }
      });
      globalFileUploader.uploadItem(blob);
    }

    $scope.resetThumbnail = function() {
      apiClient.fetch('file', $scope.item.file_id).then(function(response) {
        setThumbnailFile(response);
      })
    }

    $scope.$watch('item.youtube_video_id', function(newValue, oldValue) {
      if(newValue && newValue !== oldValue) {
        $scope.loadYoutubeThumbnails();
      }
    });

    $scope.$watch('item.file_id', function(newValue, oldValue) {
      if($scope.item.type === 'FILE' && newValue !== oldValue) {
        $scope.item.thumbnail_file_id = newValue;
        apiClient.fetch('file', newValue).then(function(response) {
          setThumbnailFile(response);
        })
      }
    });

  });

  module.controller('ContactController', function($scope) {
    $scope.test = 'DDDD';
  });

  module.controller('AdminAlbumController', function($scope, $state,$modal, $stateParams, apiClient, HalCollection, $sce) {

    $scope.treeOptions = {
      dropped: function(e) {
        var nodes = e.dest.nodesScope.$modelValue;

        var source = nodes[e.source.index];
        var dest = nodes[e.dest.index];

        if(source === dest) {
          return;
        }

        $scope.albumItemRelCollection.updateIndex(source, dest);
      }
    };

    $scope.setPrimaryItem = function(album, relItem) {
      apiClient.partialUpdate('album', relItem.album_id, {
        primary_item_id: relItem.album_item_id
      }).then(function(data) {
        angular.copy(data, album);
      });
    }

    $scope.createItemAfter = function(relItem) {
      $scope.albumItemCreate().then(function(data) {
        $scope.albumItemRelCollection.createAfter(relItem, {
          'album_id': albumId,
          'album_item_id': data.id
        }, true);
      });
    }

    $scope.createItem = function() {
      $scope.albumItemCreate().then(function(data) {
        $scope.albumItemRelCollection.createFirst({
          'album_id': albumId,
          'album_item_id': data.id
        }, true);
      });
    }

    $scope.bulkUpload = function() {
      var modalInstance = $modal.open({
        templateUrl: 'template/album-bulk-upload-modal.html',
        controller: 'AlbumBulkUploadModalController',
        resolve: {
          album: function() {
            return $scope.album;
          }
        },
        size: 'lg'
      });

      modalInstance.result.then(function() {
        $scope.albumItemRelCollection.fetchCurrent();
      });

      return modalInstance.result;
    };
  });

  module.controller('AlbumBulkUploadModalController', function($scope, globalFileUploader, album, $modalInstance, apiClient) {
    $scope.uploader = globalFileUploader;

    $scope.fileOptions = {
      albumItemFile: true,
      formData: [{
        filesystem: 'album_item'
      }],
      onSuccess: function(response, status, headers) {
        this.albumItem = {
          name: this._file.name,
          type: 'FILE',
          file_id: response.id,
          thumbnail_file_id: response.id
        };
      }
    }

    $scope.remove = function(fileItem) {
      if(fileItem.albumItem && fileItem.albumItem.id) {
        apiClient.remove('album_item', fileItem.albumItem.id);
      }
      fileItem.remove();
    }

    $scope.save = function(fileItem) {
      var item = fileItem.albumItem;

      if(item.id) {
        apiClient.update('album_item', item.id, item).then(function(data) {
          angular.extend(item, data);
        });
        return;
      }

      apiClient.create('album_item', item).then(function(data) {
        angular.extend(item, data);
        apiClient.create('album_item_rel', {
          album_id: album.id,
          album_item_id: item.id
        });
      });
    }

    $scope.saveAll = function() {
      angular.forEach($scope.uploader.queue, function(fileItem) {
        if(!fileItem.albumItem) {
          return;
        }

        $scope.save(fileItem);
      });
    }

    $scope.close = function() {

    }
  });

  module.controller('AdminAlbumCollectionController', function($scope, $state, $modal, $stateParams, apiClient, HalCollection) {

    $scope.createNewAlbum = function(relItem) {
      $scope.albumCreate().then(function(data) {
        $state.go('app.home.album', {albumId: data.id});
      });
    }

  });

  return module;
});