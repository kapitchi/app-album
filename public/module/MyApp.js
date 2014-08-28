define([
    'angular',
    'moment',
    //'angular-strap.tpl',
    'angular-animate',
    'angular-ui-router',
    'angular-ui-tree',
    'ng-tags-input',
    'textAngular',
    'angular-moment',
    //'angular-ui-sortable',
    'module/kap-hal',
    //'angular-xeditable',
    //'module/KapLogin',
    'module/kap-security',
    'module/KapFileManager'
    //'module/KapAlbum'
], function(angular, moment) {

    //moment stuff
    //http://momentjs.com/docs/#/customization/calendar/
    moment.lang('en-GB', {
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

    var module = angular.module('MyApp', [
        'ngAnimate',
        //'mgcrea.ngStrap',
        'ui.router',
        'ui.tree',
        'ngTagsInput',
        'textAngular',
        'angularMoment',
        'KapHal',
        //'xeditable',
        //'KapLogin',
        'KapSecurity',
        'KapFileManager',
        //'KapAlbum'
    ]);
    
    module.config(function($stateProvider, $urlRouterProvider, $provide, datepickerConfig, datepickerPopupConfig) {

        angular.extend(datepickerConfig, {
            
        });

        angular.extend(datepickerPopupConfig, {
            datepickerPopup: 'dd/MM/yyyy'
        });
        
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
            edit: false,
            editor: {
                //https://github.com/fraywing/textAngular/wiki/Customising-The-Toolbar
                defaultToolbar: [['bold','italics', 'underline'], ['ul', 'ol'], ['html']]
            }
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
                templateUrl: 'template/album-item-edit.html',
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

        $rootScope.fullScreenGallery = function(albumItems, current) {
            
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

    module.controller('AlbumItemModalController', function($scope, $modalInstance, apiClient, albumItem, $http, $q) {
        $scope.item = albumItem;
        
        $scope.thumbnails = [];
        $scope.selectedThumbnail = null;
        
        $scope.selectThumbnail = function(thumb) {
            $scope.selectedThumbnail = thumb;
            $scope.item.thumbnail_file_url = thumb.url;
        }
        
        $scope.loadYoutubeThumbnails = function() {
            var videoId = $scope.item.youtube_video_id;

            $http.get('http://gdata.youtube.com/feeds/api/videos/' + videoId + '?v=2&alt=json').then(function(data) {
                for(var i in data.data.entry['media$group']['media$thumbnail']) {
                    var thumb = data.data.entry['media$group']['media$thumbnail'][i];
                    if(thumb['yt$name'] === 'sddefault') {
                        $scope.selectThumbnail({
                            url: thumb['url']
                        });
                        return;
                    }
                }
            });
        }
        
        $scope.loadTags = function(query) {
            return apiClient.fetchAll('tag', {
                fulltext: query
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
        
        $scope.$watch('item.youtube_video_id', function(newValue, oldValue) {
            if(newValue && newValue != oldValue) {
                $scope.loadYoutubeThumbnails();
            }
        });

        $scope.$watch('item.file_id', function(newValue, oldValue) {
            if($scope.item.type === 'FILE' && newValue) {
                $scope.item.thumbnail_file_id = newValue;
            }
        });
    });
    
    module.controller('ContactController', function($scope) {
        $scope.test = 'DDDD';
    });

    module.controller('AlbumController', function($scope, $state,$modal, $stateParams, apiClient, KapHalCollection, $sce) {
        
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
        
        $scope.loader.load(apiClient.fetch('album', albumId).then(function(data) {
            $scope.album = data;
        }));
        
        $scope.albumItemRelCollection = new KapHalCollection(apiClient, 'album_item_rel');
        $scope.loader.load($scope.albumItemRelCollection.fetch({
                album_id: albumId
            },
            {
                index: 'ASC'
            }
        ));
        
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

//        $scope.treeOptions = {
//            dropped: function(e) {
//                var nodes = e.dest.nodesScope.$modelValue;
//
//                var source = nodes[e.source.index];
//                var dest = nodes[e.dest.index];
//
//                if(source === dest) {
//                    return;
//                }
//
//                $scope.albumItemRelCollection.updateIndex(source, dest);
//            }
//        };

        $scope.createNewAlbum = function(relItem) {
            $scope.albumCreate().then(function(data) {
                $state.go('app.home.album', {albumId: data.id});
            });
        }

    });

    module.controller('TagFilterController', function($scope, $state, $modal, $stateParams, apiClient, KapHalCollection) {
        $scope.tag = null;
        
        apiClient.fetch('tag', $stateParams.tagId).then(function(tag) {
            $scope.tag = tag;
        });
        
    });

    module.directive('localDateToString', function($filter) {
        function link(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                if(value instanceof Date) {
                    return $filter('date')(value, "yyyy-MM-ddT00:00:00'Z'", 'UTC');
                }
                
                return value;
            });

//            ngModel.$formatters.unshift(function(value) {
//                console.log(value); //XXX
//                return $filter('date')(value, "dd/MM/YYYY");
//            });
        }
        
        return {
            require: 'ngModel',
            link: link
        }
    })

    return module;
});