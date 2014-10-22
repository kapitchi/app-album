module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //grunt.registerTask('build', ['requirejs', 'ngtemplates', 'concat:dist']);
    grunt.registerTask('build', [
      'clean:jsbuild', 'requirejs:common',
      'requirejs:clientApp', 'ngAnnotate:clientApp', //'uglify:clientApp',
      'requirejs:adminApp', 'ngAnnotate:adminApp', //'uglify:adminApp'
    ]);
  
    var commonLibs = ['module/main-app'];

    grunt.initConfig({
        bower: {
            requirejs: {
                rjsConfig: 'public/config.js',
                options: {
                    baseUrl: './public'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            }
        },
        requirejs: {
          common: {
            options: {
              baseUrl: "public",
              include: commonLibs,
              mainConfigFile: "public/config.js",
              out: "public/build/js/common.js",
              optimize: 'none',
              wrapShim: true,
              preserveLicenseComments: false
              //generateSourceMaps: true
            }
          },
          clientApp: {
              options: {
                baseUrl: "public",
                name: 'module/client-app',
                mainConfigFile: "public/config.js",
                out: "public/build/js/client-app.js",
                exclude: commonLibs,
                optimize: 'none',
                wrapShim: true,
                preserveLicenseComments: false
                //generateSourceMaps: true
              }
          },
          adminApp: {
            options: {
              baseUrl: "public",
              name: 'module/admin-app',
              mainConfigFile: "public/config.js",
              out: "public/build/js/admin-app.js",
              exclude: commonLibs,
              optimize: 'none',
              wrapShim: true,
              preserveLicenseComments: false
              //generateSourceMaps: true
            }
          }
        },
        ngtemplates: {
          MyApp:        {
            cwd:      'public',
            src:      ['template/**.html', 'template/**/*.html'],
            dest:     'public/build/js/template.js',
            options:  {
              prefix:   '/'
            }
          }
        },
        concat: {
          dist: {
            src: ['public/build/js/*.js'],
            dest: 'public/build/all.js',
            sourceMap: true
          }
        },
        ngAnnotate: {
          options: {
            singleQuotes: true
          },
          clientApp: {
            files: {
              'public/build/js/client-app.js': ['public/build/js/client-app.js']
            }
          },
          adminApp: {
            files: {
              'public/build/js/admin-app.js': ['public/build/js/admin-app.js']
            }
          }
        },
        clean: {
          jsbuild: {
            src: ["public/build/js/*"]
          }
        },
        uglify: {
          clientApp: {
            files: {
              'public/build/js/client-app.js': ['public/build/js/client-app.js']
            }
          },
          adminApp: {
            files: {
              'public/build/js/admin-app.js': ['public/build/js/admin-app.js']
            }
          }
        }
    });

};
