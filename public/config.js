require.config({
    baseUrl: '/',
    waitSeconds: 30,
    paths: {
        jquery: 'vendor/jquery/dist/jquery',
        'jquery-ui': 'vendor/jquery-ui/jquery-ui.min',
        angular: 'vendor/angular/angular',
        affix: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/affix',
        alert: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/alert',
        button: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/button',
        carousel: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/carousel',
        collapse: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/collapse',
        dropdown: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/dropdown',
        tab: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/tab',
        transition: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/transition',
        scrollspy: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/scrollspy',
        modal: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/modal',
        tooltip: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/tooltip',
        popover: 'vendor/bootstrap-sass-official/vendor/assets/javascripts/bootstrap/popover',
        requirejs: 'vendor/requirejs/require',
        'angular-bootstrap': 'vendor/angular-bootstrap/ui-bootstrap-tpls',
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router',
        'angular-file-upload': 'vendor/angular-file-upload/angular-file-upload',
        'angular-xeditable': 'vendor/angular-xeditable/dist/js/xeditable',
        'angular-ui-sortable': 'vendor/angular-ui-sortable/sortable',
        'angular-ui-tree': 'vendor/angular-ui-tree/dist/angular-ui-tree',
        moment: 'vendor/moment/min/moment-with-locales.min',
        'angular-moment': 'vendor/angular-moment/angular-moment',
        textAngular: 'vendor/textAngular/src/textAngular',
        'angular-sanitize': 'vendor/textAngular/dist/textAngular-sanitize.min',
        'angular-animate': 'vendor/angular-animate/angular-animate',
        'angular-strap': 'vendor/angular-strap/dist/angular-strap.min',
        'angular-strap.tpl': 'vendor/angular-strap/dist/angular-strap.tpl.min',
        'ng-tags-input': 'vendor/ng-tags-input/ng-tags-input.min',
        ngInfiniteScroll: 'vendor/ngInfiniteScroll/build/ng-infinite-scroll',
        'angular-easyfb': 'vendor/angular-easyfb/angular-easyfb',
        'ng-preload-src': 'vendor/ng-preload-src/ng-preload-src',
        'angular-loading-bar': 'vendor/angular-loading-bar/build/loading-bar',
        ngImgCrop: 'vendor/ngImgCrop/compile/minified/ng-img-crop',
        ngstorage: 'vendor/ngstorage/ngStorage',
        jcrop: 'vendor/Jcrop/js/jquery.Jcrop',
        caman: 'vendor/caman/dist/caman.min',
        'caman.full': 'vendor/caman/dist/caman.full.min',
        darkroom: 'vendor-import/darkroomjs/mybuild/js/darkroom',
        'angular-medium-editor': 'vendor/angular-medium-editor/dist/angular-medium-editor',
        'medium-editor': 'vendor/medium-editor/dist/js/medium-editor',
        'angular-messages': 'vendor/angular-messages/angular-messages',
        fabric: 'vendor/fabric/dist/fabric.require',
        textAngularSetup: 'vendor/textAngular/src/textAngularSetup',
        'oauth-ng': 'vendor/oauth-ng/dist/oauth-ng',
        'angular-google-maps': 'vendor/angular-google-maps/dist/angular-google-maps',
        lodash: 'vendor/lodash/dist/lodash.compat'
    },
    shim: {
        'angular-google-maps': {
            deps: [
                'angular',
                'lodash'
            ]
        },
        jquery: {
            exports: 'jquery'
        },
        'jquery-ui': {
            deps: [
                'jquery'
            ]
        },
        jcrop: {
            deps: [
                'jquery'
            ]
        },
        darkroom: {
            exports: 'Darkroom',
            deps: [
                'fabric'
            ]
        },
        fabric: {
            exports: 'fabric'
        },
        'angular-strap': {
            deps: [
                'angular'
            ]
        },
        'angular-strap.tpl': {
            deps: [
                'angular-strap'
            ]
        },
        angular: {
            exports: 'angular',
            deps: [
                'jquery'
            ]
        },
        'angular-sanitize': {
            deps: [
                'angular'
            ]
        },
        'angular-bootstrap': {
            deps: [
                'angular'
            ]
        },
        'angular-messages': {
            deps: [
                'angular'
            ]
        },
        affix: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.affix'
        },
        alert: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.alert'
        },
        button: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.button'
        },
        carousel: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.carousel'
        },
        collapse: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.collapse'
        },
        dropdown: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.dropdown'
        },
        modal: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.modal'
        },
        popover: {
            deps: [
                'jquery',
                'tooltip'
            ],
            exports: '$.fn.popover'
        },
        scrollspy: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.scrollspy'
        },
        tab: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.tab'
        },
        tooltip: {
            deps: [
                'jquery'
            ],
            exports: '$.fn.tooltip'
        },
        transition: {
            deps: [
                'jquery'
            ],
            exports: '$.support.transition'
        },
        'angular-resource': {
            deps: [
                'angular'
            ]
        },
        'angular-animate': {
            deps: [
                'angular'
            ]
        },
        'angular-route': {
            deps: [
                'angular'
            ]
        },
        'angular-ui-router': {
            deps: [
                'angular'
            ]
        },
        'angular-file-upload': {
            deps: [
                'angular'
            ]
        },
        'angular-ui-sortable': {
            deps: [
                'angular',
                'jquery-ui'
            ]
        },
        'angular-xeditable': {
            deps: [
                'angular'
            ]
        },
        'angular-ui-tree': {
            deps: [
                'angular'
            ]
        },
        'angular-moment': {
            deps: [
                'angular',
                'moment'
            ]
        },
        moment: {
            exports: 'moment'
        },
        textAngular: {
            deps: [
                'angular',
                'angular-sanitize',
                'textAngularSetup',
                'vendor/textAngular/dist/textAngular-rangy.min'
            ]
        },
        textAngularSetup: {
            deps: [
                'angular'
            ]
        },
        'ng-tags-input': {
            deps: [
                'angular'
            ]
        },
        'angular-easyfb': {
            deps: [
                'angular'
            ]
        },
        'ng-preload-src': {
            deps: [
                'angular'
            ]
        },
        'angular-loading-bar': {
            deps: [
                'angular'
            ]
        },
        ngInfiniteScroll: {
            deps: [
                'jquery',
                'angular'
            ]
        },
        ngImgCrop: {
            deps: [
                'angular'
            ]
        },
        ngstorage: {
            deps: [
                'angular'
            ]
        },
        'medium-editor-button': {
            deps: [
                'medium-editor'
            ]
        },
        'angular-medium-editor': {
            deps: [
                'medium-editor',
                'angular'
            ]
        }
    },
    packages: [

    ],
    deps: [

    ],
    config: {

    }
});
