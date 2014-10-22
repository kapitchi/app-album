define([
  'angular',
  'darkroom'
], function(angular, Darkroom) {

  function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  }

  Darkroom.plugins['ngSave'] = Darkroom.Plugin.extend({
    defaults: {
    },

    initialize: function InitDarkroomSavePlugin() {
      var buttonGroup = this.darkroom.toolbar.createButtonGroup();

      this.destroyButton = buttonGroup.createButton({
        image: 'save'
      });

      this.destroyButton.addEventListener('click', this.options.callback.bind(this));
    },
  });

  var module = angular.module('ng-darkroom', []);

  module.directive('cropSelection', function($filter, $http, globalFileUploader, $timeout) {
    function link($scope, $element, $attrs, ngModel) {
      var darkroom;
      
//      $attrs.$observe('ngSrc', function(newValue, oldValue) {
//        if(darkroom) {
//          darkroom.selfDestroy();
//        }
//        $element.attr('src', newValue);
//      });
      
      $element.bind('load', function() {

        if(darkroom) {
          darkroom.selfDestroy();
        }
        
        $timeout(function() {
          darkroom = new Darkroom($element[0], {
            plugins: {
              save: false,//disable default save
              ngSave: {
                callback: function() {
                  var dataURL = this.darkroom.image.toDataURL({
                    'format': 'jpeg'
                  });
                  var blob = dataURItoBlob(dataURL);
  
                  $scope.save({
                    $dataURL: dataURL,
                    $blob: blob
                  });
  
                  //this.darkroom.selfDestroy();
                }
              }
            }
            
          });
        });
      });

      $scope.$on('$destroy', function() {
        if(darkroom) {
          darkroom.selfDestroy();
        }
      });
    }

    return {
      link: link,
      //priority: 150,
      scope: {
        save: '&onSave'
      }
    }
  });

})