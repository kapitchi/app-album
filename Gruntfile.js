module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build', ['requirejs', 'ngtemplates', 'concat:dist']);

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
            compile: {
                options: {
                  baseUrl: "public",
                  name: 'module/MyApp',
                  mainConfigFile: "public/config.js",
                  out: "public/build/js/app.js",
                  optimize: 'none',
                  //todo
                  generateSourceMaps: true
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
              //usemin: 'dist/vendors.js' // <~~ This came from the <!-- build:js --> block
            }
          }
        },
        concat: {
          dist: {
            src: ['public/build/js/*.js'],
            dest: 'public/build/all.js',
            sourceMap: true
          }
        }
    });

};
