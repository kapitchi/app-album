define(['angular'], function(angular) {

angular.module('KapHal', [])
    .factory('KapHalClient', function($http, $q) {
        
        function KapHalClient(baseUrl) {
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
            
            
            this.fetchAll = function(service, query, orderBy, pageSize, page) {
                var deferred = $q.defer();
                var url = baseUrl + service;

                var queryObj = {
                    page: 1
                };

                if(query) {
                    queryObj.query = query;
                }

                if(pageSize) {
                    queryObj.page_size = pageSize;
                }

                if(page) {
                    queryObj.page = page;
                }

                if(orderBy) {
                    queryObj.order_by = orderBy;
                }

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
        
        return KapHalClient; 
    })

    .factory('KapHalCollection', function($q) {
        
        function KapHalCollection(repository, service) {
            var self = this;
            
            this.repository = repository;
            this.service = service;
            
            this.page = 1;
            this.items = [];
            this.links = {};
            this.pageCount = 0;
            this.pageSize = 0;
            this.totalItems = 0;
            this.indexProperty = 'index';
            
            this.fetch = function(query, orderBy, pageSize, page) {
                return repository.fetchAll(self.service, query, orderBy, pageSize, page).then(function(data) {
                    self.links = data._links;
                    self.items = data._embedded[self.service];
                    self.totalItems = data.total_items;
                    self.pageSize = data.page_size;
                    self.pageCount = data.page_count;
                    
                    return self;
                });
            }
            
            this.updateIndex = function(item1, item2) {
                var sourceIndex = item1[self.indexProperty];
                item1[self.indexProperty] = item2[self.indexProperty];
                item2[self.indexProperty] = sourceIndex;

                var update = {};
                update[self.indexProperty] = item1[self.indexProperty];
                self.repository.partialUpdate(self.service, item1.id, update);

                var update2 = {};
                update2[self.indexProperty] = item2[self.indexProperty];
                self.repository.partialUpdate(self.service, item2.id, update2);
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
                    
                    return self.repository.create(service, item).then(function(data) {
                        angular.extend(item, data);
                        
                        self.items.splice(itemArrayIndex, 0, item);

                        return item;
                    });
                }

                self.items.splice(itemArrayIndex, 0, item);

                var def = $q.defer();
                def.resolve(item);
                return def.promise;
            }
            
            this.createFirst = function(item, api) {
                item.index = 1;
                
                if(api) {
                    return self.repository.create(service, item).then(function(data) {
                        angular.extend(item, data);

                        self.items.unshift(item);

                        return item;
                    });
                }
                
                self.items.unshift(item);

                var def = $q.defer();
                def.resolve(item);
                return def.promise;
            }
            
            this.remove = function(item, api) {
                var arrayIndex = self.items.indexOf(item);
                if(arrayIndex === -1) {
                    throw "Not existing relItem";
                }

                if(api) {
                    return self.repository.remove(service, item.id).then(function(data) {
                        self.items.splice(arrayIndex, 1);
                        return item;
                    });
                }

                self.items.splice(arrayIndex, 1);

                var def = $q.defer();
                def.resolve(item);
                return def.promise;
            }
            
        }
        
        KapHalCollection.createAndFetch = function(apiClient, service, query, orderBy, pageSize, page) {
            var ins = new KapHalCollection(apiClient, service);
            ins.fetch(query, orderBy, pageSize, page);
            return ins;
        }

        return KapHalCollection;
    })
});