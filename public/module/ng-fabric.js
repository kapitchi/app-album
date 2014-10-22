define([
  'angular',
  'fabric'
], function(angular, fabric) {
  
  var module = angular.module('ng-fabric', []);
  
  module.service('fabricUtils', function() {
    this.dataUriToBlob = function(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
    }
  });

  module.directive('fabricImg', function() {
    return {
      require: '^fabricEditor',
      link: function($scope, $element, $attrs, fabricEditor) {
        $element.addClass('ng-hide');
        $element.on('load', function(e) {
          var img = new fabric.Image(e.target);
          fabricEditor.setImage(img);
        });
      }
    }
  });

  module.directive('fabricSelectionPreview', function() {
    return {
      require: '^fabricEditor',
      scope: {
        fabricSelectionPreview: '='
      },
      link: function($scope, $element, $attrs, fabricEditor) {

        $scope.$on('fabric:selection', function(e, selection) {

          var img = fabricEditor.getImage();
          var scale = fabricEditor.getScale();
          
          var dataURL = img.toDataURL({
            format: 'jpeg',
            left: selection.left,
            top: selection.top,
            width: selection.width,
            height: selection.height,
            multiplier: 1 / scale
          });

          $scope.$apply(function() {
            $scope.fabricSelectionPreview = dataURL;
          });
        });
      }
    }
  });

  module.directive('fabricSelection', function() {
    return {
      require: '^fabricEditor',
      link: function($scope, $element, $attrs, fabricEditor) {

        var canvas = fabricEditor.getCanvas();

        var rect = new fabric.Rect({
          fill: 'transparent',
          lockRotation: true,
          //lockUniScaling: true,
          originX: 'left',
          originY: 'top',
          width: 1,
          height: 1,
          stroke: 'white',
          strokeWidth: 3,
          strokeDashArray: [2, 2],
          visible: false,
          //selectable: false
        });

        canvas.add(rect);
        
        canvas.setActiveObject(rect);
        canvas.on('selection:cleared', function() {
          canvas.setActiveObject(rect);
        });

        var selected = false;
        var drag = false;
        
        rect.on('modified', function() {
          broadcast();
        });
        
        function mouseCoords(e) {
          return {
            x: e.e.offsetX,
            y: e.e.offsetY
          }
        }

        canvas.on('mouse:down', function(event) {
          if(selected) {
            return;
          }
          
          drag = true;

          rect.setVisible(true);
          
          var mouse = mouseCoords(event);

          rect.setLeft(mouse.x);
          rect.setTop(mouse.y);
          //rect.setCoords();

          canvas.renderAll();
        });

        canvas.on("mouse:move", function (event) {
          if (!drag) {
            return;
          }

          var mouse = mouseCoords(event);

          rect.setWidth(mouse.x - rect.getLeft());
          rect.setHeight(mouse.y - rect.getTop());
          //rect.setCoords();

          canvas.renderAll();
        });

        canvas.on("mouse:up", function (event) {
          if(!drag) {
            return;
          }
          
          rect.set('selectable', true);
          rect.setCoords();

          canvas.renderAll();

          drag = false;
          selected = true;
          
          broadcast();
          
        });
        
        function broadcast() {
          $scope.$broadcast('fabric:selection', {
            width: rect.getWidth(),
            height: rect.getHeight(),
            top: rect.getTop(),
            left: rect.getLeft()
          });
        }
        
      }
    }
  });

  module.directive('fabricEditor', function() {
    return {
      restrict: 'EA',
      transclude: true,
      //replace: true,
      template: '<canvas></canvas><div ng-transclude></div>',
      //priority: 150,
      link: function($scope, $element, $attrs) {
        
      },
      controller: function($scope, $element) {
        
        var scale = 1;

        var canvasEl = $element.find('canvas')[0];
        var canvas = new fabric.Canvas(canvasEl);

        canvas.selection = false;

        $scope.$on('$destroy', function() {
          //todo
        });
        
        canvas.setWidth($element[0].offsetWidth);
        canvas.setHeight($element[0].offsetHeight);
        
        this.getCanvas = function() {
          return canvas;
        }
        
        this.getScale = function() {
          return scale;
        }
        
        this.setImage = function(img) {
          image = img;

          image.set({originX: 'left',
            originY: 'top'
          });
          
          if(image.width / image.height > 1) {
            image.scaleToWidth(canvas.getWidth());
            canvas.setHeight(image.getHeight());
          }
          else {
            image.scaleToHeight(canvas.getHeight());
            canvas.setWidth(image.getWidth());
          }
          
          scale = image.getScaleX();

          canvas.setBackgroundImage(image, function() {
            canvas.renderAll();
          });
          
        };
        
        this.getImage = function() {
          return image;
        }

      }
    }

  });

})