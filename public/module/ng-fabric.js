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

        var options = $scope.$eval($attrs.fabricSelection);
        options = angular.extend({
          aspectRatio: false,
          minWidth: 1,
          minHeight: 1
        }, options);
        
        if(options.aspectRatio) {
          options.minHeight = options.minWidth / options.aspectRatio;
        }
        
        var ready = false;
        
        var scale = 1;
        var canvas = fabricEditor.getCanvas();
        
        console.log(canvas); //XXX

        var rect = new fabric.Rect({
          fill: 'transparent',
          lockRotation: true,
          hasRotatingPoint: false,
          lockUniScaling: !!options.aspectRatio,
          originX: 'left',
          originY: 'top',
          width: options.minWidth,
          height: options.minHeight,
          minScaleLimit: 1,
          stroke: 'white',
          strokeWidth: 3,
          strokeDashArray: [2, 2],
          visible: false
        });

        canvas.add(rect);
        
        //"ON LOAD"
        $scope.$on('fabric:image', function(e, fabricEditor) {
          scale = fabricEditor.getScale();
          ready = true;
          
          rect.width = options.minWidth * scale;
          rect.height = options.minHeight * scale;
        });
        //END

        canvas.setActiveObject(rect);
        canvas.on('selection:cleared', function() {
          canvas.setActiveObject(rect);
        });

        var selected = false;
        var drag = false;
        var previousCorrect = false;

        function rectConstrains() {

          var coords = rect.getBoundingRect();

          var canvasWidth = canvas.getWidth();
          var canvasHeight = canvas.getWidth();

          if(rect.isContainedWithinRect({x: 0, y: 0}, {x: canvasWidth, y: canvasHeight})) {
            return;
          }
          
          if(coords.left < 0) {
            rect.setLeft(0);
          }
          
          if(coords.top < 0) {
            rect.setTop(0);
          }
          
          if(coords.top + coords.height > canvasHeight) {
            rect.setHeight(canvasHeight - coords.top);
          }
          if(coords.left + coords.width > canvasWidth) {
            rect.setWidth(canvasWidth - coords.left);
          }
          
          rect.setCoords();
          
          var state = rect.saveState();
          console.log(state); //XXX
        }

        //rect.on('moving', rectConstrains);
        //rect.on('scaling', rectConstrains);
        
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
          if(!ready || selected) {
            return;
          }
          
          drag = true;

          rect.setVisible(true);
          
          var mouse = mouseCoords(event);

          rect.setLeft(mouse.x);
          rect.setTop(mouse.y);

          canvas.renderAll();
        });

        canvas.on("mouse:move", function (event) {
          if (!drag) {
            return;
          }

          var mouse = mouseCoords(event);

          var width = mouse.x - rect.getLeft();
          var height = mouse.y - rect.getTop();

          //fix scaling
          var scaledWidth = options.minWidth * scale;
          var scaledHeight = options.minHeight * scale;

          if(width < scaledWidth) {
            width = scaledWidth;
          }

          if(height < scaledHeight) {
            height = scaledHeight;
          }
          //END

          //aspectRatio
          if(options.aspectRatio) {
            var curr = rect.width / rect.height;
            
            if(curr > options.aspectRatio) {
              height = rect.width / options.aspectRatio;
            }
            else {
              width = rect.height * options.aspectRatio;
            }
          }
          //END

          rect.setWidth(width);
          rect.setHeight(height);

          canvas.renderAll();
        });

        canvas.on("mouse:up", function (event) {
          //rectConstrains();
          
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
      //transclude: true,
      //replace: true,
      //template: '<canvas></canvas><div ng-transclude></div>',
      //priority: 150,
      scope: true,
      link: function($scope, $element, $attrs) {
        
      },
      controller: function($scope, $element) {

        var image;
        var self = this;
        var scale = 1;
        
        var canvasEl = angular.element('<canvas></canvas>');
        $element.append(canvasEl);

        var canvas = new fabric.Canvas(canvasEl[0]);

        canvas.selection = false;

        $scope.$on('$destroy', function() {
          //todo
        });
        
        canvas.setWidth($element[0].offsetWidth);
        canvas.setHeight($element[0].offsetHeight);
        
        canvas.setWidth(300);
        canvas.setHeight(300);

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
            $scope.$broadcast('fabric:image', self);

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