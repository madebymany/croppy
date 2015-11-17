/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.initConfig({

    meta: {
      version: '0.1.1',
      banner: '// Croppy, v<%= meta.version %>\n'
    },

    'jasmine' : {
      'croppy': {
        src : 'dist/croppy.js',
        options: {
          specs : 'spec/**/*.spec.js',
          helpers : 'spec/helpers/*.js'
        }
      }
    },

    browserify: {
      debug: {
        src: [],
        dest: 'dist/croppy.debug.js',
        options: {
          browserifyOptions: {
            debug: true
          }
        }
      },

      dist: {
        src: [],
        dest: 'dist/croppy.js'
      },

      options: {
        transform: [['jstify', {engine: 'lodash-micro'}]],
        require: ['.:croppy']
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      standard: {
        files: {
          'dist/croppy.min.js': ['dist/croppy.js']
        }
      }
    },

    watch: {
      scripts: {
        files: ['index.js', 'src/**/*.js', 'src/**/*.jst'],
        tasks: ['default']
      }
    },

    jshint: {
      all: ['dist/croppy.js'],
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
    }
  });

  // Default task.
  grunt.registerTask('default', ['browserify:debug']);
  grunt.registerTask('test', ['default', 'jasmine']);
  grunt.registerTask('build', ['browserify', 'uglify']);

};
