#!/usr/bin/env node

var requirejs = require('requirejs');
var fs = require('fs');

var BUILD_PATH = "public/build/js/";
var BUILD_URL = "/build/js/";
var CONFIG_FILE = "public/config.js";
var BUILD_CONFIG_PATH = 'public/build/config.js';//this should be outside of BUILD_PATH
var BASE_URL = "public";

//@todo mz: this is very stupidly implemented e.g. requirebuilder but it works! REFACTOR!
//@todo mz: collections should be defined in JSON file outside of this script

function requirebuilder() {
  var imported = {};
  var all = [];

  this.addImported = function(bundle, module) {
    if(!imported[bundle]) {
      imported[bundle] = [];
    }

    if(imported[bundle].indexOf(module) !== -1) {
      return;
    }

    all.push(module);
    imported[bundle].push(module);
  }
  
  this.getAllModules = function() {
    return all;
  }

  this.getPaths = function() {

    var paths = {};

    for(var k in imported) {
      for(var i in imported[k]) {
        paths[imported[k][i]] = k;
      }
    }

    return paths;
  }
}

var builder = new requirebuilder();

var collections = [
  {
    name: 'common',
    include: [
      'module/main-app'
    ]
  },
  {
    name: 'client-app',
    include: [
      'module/client-app'
    ]
  },
  {
    name: 'admin-app',
    include: [
      'module/admin-app'
    ]
  }
];

var modules = [];

collections.forEach(function(col) {
  var mod = {
    _name: col.name,
    baseUrl: BASE_URL,
    mainConfigFile: CONFIG_FILE,
    include: col.include,
    out: BUILD_PATH + col.name + ".js",
    wrapShim: true,
    generateSourceMaps: true,
    optimize: 'none',
    onBuildWrite: function(moduleName, path, contents) {
      //builder.addImported(col.name, moduleName);
      builder.addImported(BUILD_URL + col.name, moduleName);
      return contents;
    }
  };

  modules.push(mod);
});

var counter = 0;

function run(modules) {
  var module = modules.shift();
  
  module.exclude = builder.getAllModules();
  
  requirejs.optimize(module, function(ret) {
    console.log('Finished: ', module.out); //XXX

    if(modules.length) {
      run(modules);
      return;
    }
  
    var paths = builder.getPaths();
    
    var buildConfigFileContent = 'require.config({paths: ' + JSON.stringify(paths, null, 4) + ', deps: [/*%module%*/]});';
    fs.writeFile(BUILD_CONFIG_PATH, buildConfigFileContent);

    console.log('Build config wrote to ' + BUILD_CONFIG_PATH);
    console.log(buildConfigFileContent);
    
  }, function(err) {
    console.log(err); //XXX
  });
}

run(modules);