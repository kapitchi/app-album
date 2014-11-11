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
  'angular-medium-editor',
  //'angular-xeditable',
  //'module/KapLogin',
  'module/kap-security',
  'module/KapFileManager',
], function(angular, moment) {

  var module = angular.module('admin-app', [
    'main-app',
    'client-app',
    'ng-fabric',
    'ui.tree',
    'ngTagsInput',
    'textAngular',
    'ngImgCrop',
    'angular-medium-editor',
    //'xeditable',
    //'KapLogin',
    'KapSecurity',
    'KapFileManager',
  ]);

  module.config(function($stateProvider, $urlRouterProvider, $provide) {

  });

  module.run(function($rootScope) {
    //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  });
  
  module.constant('editorConfig', {
      //https://github.com/fraywing/textAngular/wiki/Customising-The-Toolbar
      defaultToolbar: [['bold','italics', 'underline'], ['ul', 'ol'], ['insertLink'], ['html']]
  });

  module.factory('globalFileUploader', function(FileUploader) {
    var uploader = new FileUploader({
      url: '/file',
      autoUpload: true,
      removeAfterUpload: true
    });
    return uploader;
  });

  module.controller('GlobalFileUploadManagerController', function($scope, globalFileUploader) {
    $scope.uploader = globalFileUploader;

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

  module.controller('AlbumItemFormController', function($scope, $rootScope, apiClient, $http, $q, globalFileUploader, fabricUtils, editorConfig) {
    $scope.editorToolbar = editorConfig.defaultToolbar;
    
    $scope.thumbnails = [];
    $scope.selectedThumbnail = null;
    $scope.preview = {
      
    };
    
    $scope.fabricSelectionOptions = {
      aspectRatio: 350 / 350,
      minWidth: 350
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
      var blob = fabricUtils.dataUriToBlob(dataURL);

      globalFileUploader.addToQueue(blob, {
        formData: [{
          filesystem: 'album_item_thumbnail'
        }],
        removeAfterUpload: true,
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
        console.log(newValue); //XXX
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

    var albumId = $stateParams.albumId;
    if(!albumId) {
      albumId = $state.current.albumId;
    }
    
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
      
      apiClient.partialUpdate('album_item_rel', relItem.id, {
        showcase: !relItem.showcase
      }).then(function(data) {
        angular.copy(data, relItem);
      });
    }

    $scope.createItemAfter = function(relItem) {
      $scope.albumItemCreate().then(function(data) {
        $scope.albumItemRelCollection.createAfter(relItem, {
          'parent_id': albumId,
          'item_id': data.id
        }, true);
      });
    }

    $scope.createItem = function() {
      $scope.albumItemCreate().then(function(data) {
        $scope.albumItemRelCollection.createFirst({
          'parent_id': albumId,
          'item_id': data.id
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
    
    $scope.albumItems = [];

    $scope.fileOptions = {
      formData: [{
        filesystem: 'album_item'
      }],
      onSuccess: function(response, status, headers) {
        this.albumItem = {
          name: this._file.name,
          type: 'FILE',
          file_id: response.id,
          thumbnail_file_id: response.id,
          _embedded: {
            thumbnail_file: response
          }
        };
        
        $scope.addAlbumItem(this.albumItem);
      }
    };
    
    $scope.addAlbumItem = function(albumItem) {
      $scope.albumItems.push(albumItem);
    }
    
    $scope.remove = function(albumItem) {
      
      if(albumItem.id) {
        apiClient.remove('album_item', albumItem.id).then(function() {
          //TODO
        });
      }

      $scope.albumItems.splice($scope.albumItems.indexOf(albumItem), 1);
    }

    $scope.save = function(item) {

      if(item.id) {
        apiClient.update('album_item', item.id, item).then(function(data) {
          angular.extend(item, data);
        });
        return;
      }

      apiClient.create('album_item', item).then(function(data) {
        angular.extend(item, data);
        apiClient.create('album_item_rel', {
          parent_id: album.id,
          item_id: item.id
        });
      });
    }

    $scope.saveAll = function() {
      angular.forEach($scope.uploader.queue, function(albumItem) {
        $scope.save(albumItem);
      });
    }

    $scope.close = function() {
      $modalInstance.close();
    }
  });

  module.controller('AdminAlbumCollectionController', function($scope, $state, $modal, $stateParams, apiClient, HalCollection) {

    $scope.createNewAlbum = function(relItem) {
      $scope.albumCreate().then(function(data) {
        $state.go('app.album', {albumId: data.id});
      });
    }

  });
  
  module.controller('AdminPageController', function($scope, $rootScope, apiClient) {

    $rootScope.$watch('app.edit', function(val) {
      $scope.mediumEditorOptions.disableEditing = !val;
      $scope.mediumEditorOptions.disableToolbar = !val;
    });

    $scope.save = function(page) {
      var promise;
      if(page.id) {
        promise = apiClient.update('page', page.id, page);
      }
      else {
        promise = apiClient.create('page', page);
      }
      
      promise.then(function(data) {
        angular.extend(page, data);
      });
    }
    
  });

  module.directive("kapContenteditable", function($timeout) {
    return {
      restrict: "A",
      require: "ngModel",
      link: function(scope, element, attrs, ngModel) {
        
        function read() {
          ngModel.$setViewValue(element.html());
        }
        
        element.attr('contentEditable', true);

        ngModel.$render = function() {
          element.html(ngModel.$viewValue || "");
        };

        element.bind("blur keyup change", function() {
          scope.$apply(read);
        });

        $timeout(function() {
          console.log(element[0]);//XXX
        });
      }
    };
  });

  return module;
});