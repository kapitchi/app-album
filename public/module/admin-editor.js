define([
  'angular',
  'textAngular'
], function(angular) {

  var module = angular.module('admin-editor', [
    'textAngular'
  ]);

  module.constant('editorConfig', {
    //https://github.com/fraywing/textAngular/wiki/Customising-The-Toolbar
    descriptionToolbar: [['bold','italics', 'underline'], ['ul', 'ol'], ['insertLink'], ['html']],
    pageToolbar: [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol'], ['redo', 'undo', 'clear'],
      ['justifyLeft','justifyCenter','justifyRight','indent','outdent'],
      ['insertImage', 'insertLink', 'insertVideo', 'html']
    ]
    
  });

  module.config(function($stateProvider, $urlRouterProvider, $provide) {

  });

  //textAngular config
//  module.config(function($provide){
//    $provide.decorator('taOptions', function(taRegisterTool, taOptions){
//      // $delegate is the taOptions we are decorating
//      // register the tool with textAngular
//      taRegisterTool('colourRed', {
//        iconclass: "fa fa-square red",
//        action: function(){
//          this.$editor().wrapSelection('forecolor', 'red');
//        }
//      });
//      // add the button to the default toolbar definition
//      taOptions.toolbar[1].push('colourRed');
//      return taOptions;
//    });
//  });

  module.run(function($rootScope, taRegisterTool, $modal) {

    function imgOnSelectAction(deferred, restoreSelection) {
      var tool = this;

      $modal.open({
        templateUrl: 'template/image-browser-modal.html',
        controller: function($scope, $modalInstance, apiClient, HalCollection) {

          $scope.imageCollection = HalCollection.createAndFetch('file', {
            query: {
              //filesystem: 'general',
              mimeFamily: 'image'
            }
          })

          $scope.selectImage = function(image) {
            $modalInstance.close(image);
          }
        }
      }).result.then(function(image) {

          var imageUrl = image._links.access.href;

          var cache = angular.toJson({
            fileModel: image,
            src: imageUrl
          });

          var img = angular.element('<img/>');
          img.attr('file-id', image.id);
          img.attr('cache-attrs', cache);
          img.attr('src', imageUrl);
          var html = img[0].outerHTML;

          tool.$editor().wrapSelection('insertHTML', html);

          restoreSelection();
          deferred.resolve();
        })

      return false;
    }

    taRegisterTool('colourRed', {
      iconclass: "fa fa-picture-o",
      action: imgOnSelectAction,
      onElementSelect: {
        element: 'img',
        onlyWithAttrs: ['file-id'],
        action: function(event, $element, editorScope){
          // setup the editor toolbar
          // Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic/display
          var finishEdit = function(){
            editorScope.updateTaBindtaTextElement();
            editorScope.hidePopover();
          };
          event.preventDefault();
          editorScope.displayElements.popover.css('width', '375px');
          var container = editorScope.displayElements.popoverContainer;
          container.empty();
          var buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');
          var fullButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">100% </button>');
          fullButton.on('click', function(event){
            event.preventDefault();
            $element.css({
              'width': '100%',
              'height': ''
            });
            finishEdit();
          });
          var halfButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">50% </button>');
          halfButton.on('click', function(event){
            event.preventDefault();
            $element.css({
              'width': '50%',
              'height': ''
            });
            finishEdit();
          });
          var quartButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">25% </button>');
          quartButton.on('click', function(event){
            event.preventDefault();
            $element.css({
              'width': '25%',
              'height': ''
            });
            finishEdit();
          });
          var resetButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">Reset</button>');
          resetButton.on('click', function(event){
            event.preventDefault();
            $element.css({
              width: '',
              height: ''
            });
            finishEdit();
          });
          buttonGroup.append(fullButton);
          buttonGroup.append(halfButton);
          buttonGroup.append(quartButton);
          buttonGroup.append(resetButton);
          container.append(buttonGroup);

          buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');
          var floatLeft = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-left"></i></button>');
          floatLeft.on('click', function(event){
            event.preventDefault();
            // webkit
            $element.css('float', 'left');
            // firefox
            $element.css('cssFloat', 'left');
            // IE < 8
            $element.css('styleFloat', 'left');
            finishEdit();
          });
          var floatRight = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-right"></i></button>');
          floatRight.on('click', function(event){
            event.preventDefault();
            // webkit
            $element.css('float', 'right');
            // firefox
            $element.css('cssFloat', 'right');
            // IE < 8
            $element.css('styleFloat', 'right');
            finishEdit();
          });
          var floatNone = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-justify"></i></button>');
          floatNone.on('click', function(event){
            event.preventDefault();
            // webkit
            $element.css('float', '');
            // firefox
            $element.css('cssFloat', '');
            // IE < 8
            $element.css('styleFloat', '');
            finishEdit();
          });
          buttonGroup.append(floatLeft);
          buttonGroup.append(floatNone);
          buttonGroup.append(floatRight);
          container.append(buttonGroup);

          buttonGroup = angular.element('<div class="btn-group">');
          var remove = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-trash-o"></i></button>');
          remove.on('click', function(event){
            event.preventDefault();
            $element.remove();
            finishEdit();
          });
          buttonGroup.append(remove);
          container.append(buttonGroup);

          editorScope.showPopover($element);
          editorScope.showResizeOverlay($element);
        }
      }
    });
  });

  module.directive('cacheAttrs', function() {
    return {
      link: function(element, attr) {
        console.log(element); //XXX
        console.log(attr); //XXX

        return function() {

        };
      }
    }
  });

  return module;
});