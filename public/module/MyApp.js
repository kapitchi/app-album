define([
    'angular',
    'moment',
    'angular-ui-router',
    'angular-ui-tree',
    'angular-moment',
    //'angular-ui-sortable',
    'module/kap-hal',
    //'angular-xeditable',
    //'module/KapLogin',
    'module/kap-security',
    'module/KapFileManager'
    //'module/KapAlbum'
], function(angular, moment) {

    var module = angular.module('MyApp', [
        'ui.router',
        'ui.tree',
        'KapHal',
        //'xeditable',
        //'KapLogin',
        'KapSecurity',
        'KapFileManager'
        //'KapAlbum'
    ]);

    module.config(function($stateProvider, $urlRouterProvider, $provide) {
        
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
                        controller: "AlbumCollectionController",
                        templateUrl: "template/album-collection.html"
                    },
                    'contact': {
                        controller: 'ContactController',
                        templateUrl: 'template/contact.html'
                    }
                },
                albumId: 1
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
            .state('app.login', {
                url: "/login",
                templateUrl: "template/KapLogin/login.html",
                controller: 'loginController'
            })

        $urlRouterProvider.otherwise("/home");
        
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

    module.run(function($rootScope) {
        //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        
    });

    module.factory('apiClient', function(KapHalClient) {
        var baseUrl = '/';
        return new KapHalClient(baseUrl);
    })
    
    module.controller('AppController', function($rootScope, $scope, $modal, $state, apiClient, authenticationService, $window, KapHalCollection) {

        $rootScope.app = {
            edit: false
        };

        $rootScope.auth = authenticationService;

        $rootScope.logout = function() {
            authenticationService.logout();
            $window.location = '/application/index/logout';
        }

        $rootScope.toggleEdit = function() {
            $rootScope.app.edit = !$rootScope.app.edit;
        }

        $rootScope.albumItemUpdate = function(item) {
            var modalInstance = $modal.open({
                templateUrl: 'template/album-item-edit.html',
                controller: function($scope, $modalInstance, apiClient) {
                    $scope.item = item;
                    
                    $scope.save = function() {
                        apiClient.update('album_item', $scope.item.id, $scope.item).then(function(data) {
                            angular.extend(item, data);
                            $modalInstance.close(item);
                        });
                    }
                },
                size: 'lg'
            });
            
            return modalInstance.result;
        }

        $rootScope.albumItemCreate = function() {
            var modalInstance = $modal.open({
                templateUrl: 'template/album-item-edit.html',
                controller: function($scope, $modalInstance, apiClient) {
                    $scope.item = {
                        type: 'FILE',
                        file_id: null
                    };

                    $scope.save = function() {
                        apiClient.create('album_item', $scope.item).then(function(data) {
                            $modalInstance.close(data);
                        });
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
                        apiClient.update('album', item).then(function(data) {
                            angular.extend(item, data);
                            $modalInstance.close(data);
                        });
                    }
                },
                size: 'lg'
            });

            return modalInstance.result;
        }

        $rootScope.fullscreenGallery = function(albumItems, current) {
            var modalInstance = $modal.open({
                templateUrl: 'template/fullscreen-gallery.html',
                controller: function($scope, $modalInstance, apiClient, $sce, $timeout) {
                    var currentIndex = 0;
                    $scope.currentItem = null;
                    $scope.albumItems = albumItems;
                    
                    $timeout(function() {
                        $scope.setCurrent(current);
                    });
                    
                    $scope.nextItem = function() {
                        $scope.currentItem = albumItems[++currentIndex];
                    }

                    $scope.previousItem = function() {
                        $scope.currentItem = albumItems[--currentIndex];
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
            
            return $rootScope.fullscreenGallery(items, current);
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

                    return $rootScope.fullscreenGallery(items, current);
            });
        };
        
    })
    
    module.controller('ContactController', function($scope) {
        $scope.test = 'DDDD';
    });

    module.controller('AlbumController', function($scope, $state,$modal, $stateParams, apiClient, KapHalCollection, $sce) {

        var albumId = $stateParams.albumId;
        if(!albumId) {
            albumId = $state.current.albumId;
        }
        
        $scope.album = null;
        
        apiClient.fetch('album', albumId).then(function(data) {
            $scope.album = data;
        });
        
        $scope.albumItemRelCollection = KapHalCollection.createAndFetch(apiClient, 'album_item_rel', {
                album_id: albumId
            },
            {
                index: 'ASC'
            }
        );
        
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

    });

    module.controller('AlbumCollectionController', function($scope, $state, $modal, $stateParams, apiClient, KapHalCollection) {

        $scope.albumCollection = KapHalCollection.createAndFetch(apiClient, 'album', null,
            {
                create_time: 'ASC'
            }
        );

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

        $scope.createNewAlbum = function(relItem) {
            $scope.albumCreate().then(function(data) {
                $state.go('app.home.album', {albumId: data.id});
            });
        }

    });

    module.service('modalEdit', function() {
        this.open = function(data, settings) {
            
            var modalInstance = $modal.open({
                templateUrl: settings.templateUrl,
                controller: ModalInstanceCtrl,
                size: 'lg',
                resolve: {
                    data: data
                }
            });

            modalInstance.result.then(function (newdata) {
                angular.extend(data, newData);
            });
        }
    });
    
    module.directive('modalEdit', function() {
        function link(scope, element, attrs) {
            element.on('click', function(e) {
                console.log(e); //XXX
            })

            element.on('$destroy', function() {
                //$interval.cancel(timeoutId);
            });
        }
        
        return {
            link: link,
            scope: {
                entity: '=entity'
            }
        }
    })

    return module;
});