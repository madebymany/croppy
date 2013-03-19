/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-rigger');

  grunt.initConfig({

    meta: {
      version: '0.1.1',
      banner: '// Croppy, v<%= meta.version %>\n'
    },

    lint: {
      afterconcat: ['<config:rig.build.dest>']
    },

    rig: {
      build: {
        src: ['<banner:meta.banner>', 'src/croppy.js'],
        dest: 'lib/croppy.js'
      }
    },

    min: {
      standard: {
        src: ['<banner:meta.banner>', '<config:rig.build.dest>'],
        dest: 'lib/croppy.min.js'
      }
    },

    watch: {
      files: ['<config:jasmine.specs>','src/**/*js'],
      tasks: 'default'
    },

    jasmine : {
      src : 'src/**/*.js',
      specs : 'spec/**/*.js',
      helpers : 'spec/helpers/*.js',
      timeout : 10000,
      phantomjs : {
        'ignore-ssl-errors' : true
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jasmine : false,
        describe : false,
        beforeEach : false,
        expect : false,
        it : false,
        spyOn : false,
        jQuery: true,
        console: true,
        URL:true,
        webkitURL:true
      }
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-jasmine-runner');

  // Default task.
  grunt.registerTask('default', 'lint rig min jasmine');

};