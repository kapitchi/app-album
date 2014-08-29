define(['angular'], function(angular) {

angular.module('kap-hal', [])
    .factory('HalClient', function($http, $q) {
        
        function HalClient(baseUrl) {
            function encodeQuery(obj, prefix) {
                var str = [];
                for(var p in obj) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push(typeof v == "object" ?
                        encodeQuery(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
                return str.join("&");
            }
            
            
            this.fetchAll = function(service, query) {
                var deferred = $q.defer();
                var url = baseUrl + service;

                var queryObj = {
                    page: 1
                };
                
                if(query) {
                    angular.extend(queryObj, query);
                }

//                if(query) {
//                    queryObj.query = query;
//                }
//
//                if(pageSize) {
//                    queryObj.page_size = pageSize;
//                }
//
//                if(page) {
//                    queryObj.page = page;
//                }
//
//                if(orderBy) {
//                    queryObj.order_by = orderBy;
//                }

                url += '?' + encodeQuery(queryObj);

                $http.get(url).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status, headers) {
                    console.error("HTTP GET", data, status, headers);
                    deferred.reject(status);
                });

                return deferred.promise;
            }

            this.fetch = function(service, id) {
                var deferred = $q.defer();

                $http.get(baseUrl + service + '/' + id).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status, headers) {
                    console.error("HTTP GET", data, status, headers);
                    deferred.reject(status);
                });

                return deferred.promise;
            }

            this.create = function(service, data) {
                var deferred = $q.defer();
                
                console.log(service); //XXX
                console.log(data); //XXX

                $http.post(baseUrl + service, data).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status, headers) {
                    console.error("HTTP POST", data, status, headers);
                    deferred.reject(status);
                });

                return deferred.promise;
            }

            this.update = function(service, id, data) {
                var deferred = $q.defer();

                $http.put(baseUrl + service + '/' + id, data).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status, headers) {
                    console.error("HTTP PUT", data, status, headers);
                    deferred.reject(status);
                });

                return deferred.promise;
            }

            this.partialUpdate = function(service, id, data) {
                var deferred = $q.defer();

                $http.put(baseUrl + service + '/' + id, data).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status, headers) {
                    console.error("HTTP PATCH", data, status, headers);
                    deferred.reject(status);
                });

                return deferred.promise;
            }

            this.remove = function(service, id) {
                var deferred = $q.defer();

                $http.delete(baseUrl + service + '/' + id).success(function(data) {
                    deferred.resolve(data);
                }).error(function(data, status, headers) {
                    console.error("HTTP DELETE", data, status, headers);
                });

                return deferred.promise;
            }
        }
        
        HalClient.default = null;
        
        return HalClient; 
    })
    
    .constant('HalCollectionConfig', {
        defaultQuery: {
            page: 1,
            //query: null,
            //order_by: null,
            page_size: 25
        }
    })

    .factory('HalCollection', function($q, HalClient, HalCollectionConfig) {
        
        function HalCollection(service, halClient) {
            var self = this;
            
            if(!halClient) {
                halClient = HalCollection.defaultHalClient
            }
            
            if(!halClient) {
                halClient = HalClient.default;
            }

            if(!halClient) {
                throw "No HalClient injected";
            }
            
            this.halClient = halClient;
            this.service = service;
            
            this.loading = false;
            this.items = [];
            this.links = {};
            this.pageCount = 0;
            this.totalItems = 0;
            this.indexProperty = 'index';
            
            this.query = null;
            
            this.fetch = function(query) {
                query = query || {};
                
                self.query = angular.copy(query, angular.copy(HalCollectionConfig.defaultQuery));
                
                return self.fetchCurrent();
            }
            
            this.fetchCurrent = function() {
                if(!self.query) {
                    throw "Run fetch() first";
                }

                self.loading = true;

                return self.halClient.fetchAll(self.service, self.query).then(function(data) {
                    self.links = data._links;
                    self.items = data._embedded[self.service];
                    self.totalItems = parseInt(data.total_items);
                    self.query.page_size = parseInt(data.page_size);
                    self.pageCount = parseInt(data.page_count);

                    self.loading = false;

                    return self;
                });
            }
            
            this.fetchNext = function() {
                if(!self.query) {
                    throw "Run fetch() first";
                }
                
                if(self.pageCount < self.query.page + 1) {
                    throw "There is no next page";
                }

                self.query.page++;
                
                return self.fetchCurrent();
            }

            this.fetchPrevious = function() {
                if(!self.query) {
                    throw "Run fetch() first";
                }

                if(self.page <= 1) {
                    throw "There is no previous page";
                }

                self.page--;

                return self.fetchCurrent();
            }
            
            this.updateIndex = function(item1, item2) {
                var sourceIndex = item1[self.indexProperty];
                item1[self.indexProperty] = item2[self.indexProperty];
                item2[self.indexProperty] = sourceIndex;

                var update = {};
                update[self.indexProperty] = item1[self.indexProperty];
                self.halClient.partialUpdate(self.service, item1.id, update);

                var update2 = {};
                update2[self.indexProperty] = item2[self.indexProperty];
                self.halClient.partialUpdate(self.service, item2.id, update2);
            };
            
            this.createAfter = function(relItem, item, api) {
                var relItemArrayIndex = self.items.indexOf(relItem);
                if(relItemArrayIndex === -1) {
                    throw "Not existing relItem";
                }

                var itemArrayIndex = relItemArrayIndex + 1;
                
                if(api) {
                    var index = 0;
                    if(itemArrayIndex < self.items.length) {
                        var insertBeforeItem = self.items[itemArrayIndex];
                        index = parseInt(insertBeforeItem[self.indexProperty]);
                    }
                    
                    item.index = index;
                    
                    return self.halClient.create(service, item).then(function(data) {
                        angular.extend(item, data);
                        
                        self.items.splice(itemArrayIndex, 0, item);

                        return item;
                    });
                }

                self.items.splice(itemArrayIndex, 0, item);

                return resolvePromise(item);
            }
            
            this.createFirst = function(item, api) {
                item.index = 1;
                
                if(api) {
                    return self.halClient.create(service, item).then(function(data) {
                        angular.extend(item, data);

                        self.items.unshift(item);

                        return item;
                    });
                }
                
                self.items.unshift(item);

                return resolvePromise(item);
            }
            
            this.remove = function(item, api) {
                var arrayIndex = self.items.indexOf(item);
                if(arrayIndex === -1) {
                    throw "Not existing relItem";
                }

                if(api) {
                    return self.halClient.remove(service, item.id).then(function(data) {
                        self.items.splice(arrayIndex, 1);
                        return item;
                    });
                }

                self.items.splice(arrayIndex, 1);

                return resolvePromise(item);
            }
            
            function resolvePromise(data) {
                var def = $q.defer();
                def.resolve(data);
                return def.promise;
            }
            
        }
        
        HalCollection.createAndFetch = function(service, query, apiClient) {
            var ins = new HalCollection(service, apiClient);
            ins.fetch(query);
            return ins;
        }
        
        HalCollection.defaultHalClient = null;

        return HalCollection;
    })
});